// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var FeedParser = require('feedparser');
// db
var Article = require('../../db/article').Article;

// process function
var process = function(corpus, endCallback) {
    // get url
    var url = corpus.input;
    var limit = corpus.input_count;
    var index = 0;

    // init feedparser
    var feedparser = new FeedParser();
    // add events
    feedparser.on('error', function(error) {
        // always handle errors
        console.log('FeedParser error', error);
    }).on('readable', function() {
        var stream = this;
        var meta = this.meta;
        var item = stream.read();

        while (item && index < limit) {
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
            Article.createNew(doc, function(err, article) {
                if(err) {
                    return console.log('error saving article', err);
                }
            });

            // get next item
            item = stream.read();
            // increase index
            index++;
        }

        // log end
        console.log('done processing feed');
        // trigger callback with current corpus object
        return endCallback(corpus);
    });

    // get data
    var req = request(url);
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
       .setHeader('accept', 'text/html,application/xhtml+xml');
    // add event listeners
    req.on('error', function(err) {
        this.emit('error', err);
    }).on('response', function (res) {
        var stream = this;

        if (res.statusCode !== 200) {
            return this.emit('error', new Error('Bad status code'));
        }

        stream.pipe(feedparser);
    });
};

// module
var FeedProcessing = function () {
    // Super constructor
    EventEmitter.call(this);

    // name (also ID of processer used in client)
    this.name = 'feed';

    // function
    this.process = process;

    return this;
};

module.exports = new FeedProcessing();
