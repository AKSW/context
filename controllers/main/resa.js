var logger = require('../../logger');
// config
var config = require('../../config');
var twitter = require('ntwitter');
var twit = new twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token_key: config.twitter.accessTokenKey,
  access_token_secret: config.twitter.accessTokenSecret
});

//entity to search on twitter
var search_word='Iran';

module.exports = function(app) {

    // realtime analysis
    app.get('/resa', function(req, res) {
      twit.stream('statuses/filter', { track: search_word}, function(stream) {
        stream.on('data', function(tweet) {
          logger.info(tweet.text);
        });

      });
        return res.render('resa');
    });
};
