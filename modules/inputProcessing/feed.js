// includes
var EventEmitter = require('events').EventEmitter;
var util = require('util');
// async-await fetures
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// promise
var Promise = require('bluebird');
// promisified request
var request = require('request');
// feed parser
var FeedParser = require('feedparser');

// get limited number of feed entries
var getFeedEntries = function(corpus) {
    return new Promise(function (resolve, reject) {
        // get vars from corpus
        var url = corpus.input;
        var limit = corpus.input_count;
        // init results
        var results = [];
        // init status vars
        var index = 0;

        // init feedparser
        var feedparser = new FeedParser();
        // add events
        feedparser
        .on('error', function(error) {
            // always handle errors
            reject(error);
        })
        .on('readable', function() {
            var stream = this;
            var meta = this.meta;
            var item = stream.read();

            while (item && index < limit) {
                // get data
                var title = item.title;
                var link = item.link;
                var pubDate = item.pubDate;
                var description = item.description;
                // convert to html string
                var body = '<div class="extracted-title">' + title + '</div> ' + description;
                var doc = {
                    corpuses: [corpus._id],
                    uri: link,
                    creation_date: pubDate,
                    source: body,
                };
                results.push(doc);

                // get next item
                item = stream.read();
                // increase index
                index++;
            }

            // resolve if done
            if(index >= limit) {
                return resolve(results);
            }
        })
        .on('end', function() {
            // resolve
            return resolve(results);
        });

        // get data
        var req = request(url);
        // Some feeds do not respond without user-agent and accept headers.
        req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
           .setHeader('accept', 'text/html,application/xhtml+xml');
        // add event listeners
        req.on('error', function(err) {
            reject(err);
        }).on('response', function (res) {
            var stream = this;

            if (res.statusCode !== 200) {
                return reject(new Error('Bad status code'));
            }

            stream.pipe(feedparser);
        });
    });
};

// process function
var process = async(function(corpus) {
    // get url
    var results = await(getFeedEntries(corpus));

    return results;
});

// module
var FeedProcessing = function () {
    // name (also ID of processer used in client)
    this.name = 'feed';

    // function
    this.process = process;

    return this;
};

// Inherit from EventEmitter
util.inherits(FeedProcessing, EventEmitter);

module.exports = new FeedProcessing();
