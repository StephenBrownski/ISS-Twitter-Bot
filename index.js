require('dotenv').load();

var request = require('request');

var Twit = require('twit');

var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

var T = new Twit({
  consumer_key:        process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
  access_token:        process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

request("https://api.wheretheiss.at/v1/satellites/25544", function(error, response, body){
  if (!error && response.statusCode == 200) {
    getData(body);
  }
});

function getData(data) {
  var satData = JSON.parse(data);
  var lat = satData.latitude;
  var lon = satData.longitude;

  // Test settings: lat:53.5219142, lon:-113.512807. Central Edmonton

  geocoder.reverse({ lat:53.5219142, lon:-113.512807 }, function(err, res) {
    if (!err) {
      var country = res[0]['country'];
      var countryCode = res[0]['countryCode'];
    }
    checkLastCountry(country);

  });

}

function checkLastCountry(country) {
  T.get(
    'statuses/user_timeline',
    {
      user_id: '4488159391',
      count: 3
    },
    function(err, data, response) {
      data.reverse();
      var lastTag;

      for (var tweet of data) {
        lastTag = tweet['entities']['hashtags'][0]['text'];
      }

      if (country != lastTag) {
        postTweet(country);
      }
    }
  );
}

function postTweet(country) {
  T.post('statuses/update', { status: 'TEST TWEET: Greetings to #' + country + ' from the International Space Station!' }, function(err, data, response) {
    console.log(data)
  });
}
