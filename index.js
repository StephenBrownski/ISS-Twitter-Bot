require('dotenv').load({silent: true});

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

getIssPos();
// Try and post every 30 seconds
setInterval(getIssPos, 1000*30);

function getIssPos() {
  request("https://api.wheretheiss.at/v1/satellites/25544", function(error, response, body){
    if (!error && response.statusCode == 200) {
      getData(body);
    }
  });
}

function getData(data) {
  var satData = JSON.parse(data);
  var lat = satData.latitude;
  var lon = satData.longitude;

  // Test settings: lat:53.5219142, lon:-113.512807. Central Edmonton

  geocoder.reverse({ lat:lat, lon:lon }, function(err, res) {
    if (!err) {
      var country = res[0]['country'];
      var countryCode = res[0]['countryCode'];
      country = country.replace(/ /g,'');
      checkLastCountry(country);
    }

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
      var lastTag;
      data.reverse();

      for (var tweet in data) {
        lastTag = data[tweet]['entities']['hashtags'][0]['text'];
      }

      console.log(country);
      console.log(lastTag);

      if (country != lastTag) {
        postTweet(country);
      }
    }
  );
}

function postTweet(country) {
  T.post('statuses/update', { status: 'Greetings to #' + country + ' from the International Space Station!' }, function(err, data, response) {
    console.log(data)
  });
}
