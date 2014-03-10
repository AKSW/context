// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');
// db
var Article = require('../../db/article').Article;

// process function
var process = function(corpus) {
    // get url
    var url = corpus.input;

    // get content
    request(url, function (error, response, body) {
        // convert to html string
        var doc = {
            corpuses: [corpus._id],
            uri: url,
            source: body,
        };
        Article.createNew(doc, function(err, article) {
            if(err) {
                return console.log('error saving article', err);
            }
        });
    });
};

// module
var WebpageProcessing = function () {
    // Super constructor
    EventEmitter.call( this );

    // function
    this.process = process;

    return this;
};

module.exports = new WebpageProcessing();