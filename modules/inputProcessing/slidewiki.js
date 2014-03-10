// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var crypto = require('crypto');
// function requires
var pageToJsdom = require('../../util/jsdom').pageToJsdom;
// db
var Article = require('../../db/article').Article;

// process page and return entities
var parsePage = function(body, cb) {
    // parse
    pageToJsdom(body, function($, window) {
        if(!$) {
            return cb();
        }

        // form results object
        var results = [];

        // get all posts
        var posts = $('#content ol li');
        var toProcess = posts.length;
        posts.each(function(idx, post) {
            var $post = $(post);

            // init entity
            var entity = {};
            // get link
            entity.link = 'http://slidewiki.org/' + $post.find('a').attr('href');
            // process subpage
            parseSubPage(entity.link, function(data) {
                // set data
                entity.title = data.title;
                entity.content = data.content;

                // push entity to results
                results.push(entity);
                // decrease to process counter
                toProcess--;
                // check end
                if(toProcess === 0) {
                    // free up memory
                    window.close();
                    cb(results);
                }
            });
        });
    });
};

var parseSubPage = function(url, cb) {
    request(url, function (error, response, body) {
        if (error) {
            return console.log('error loading slidewiki subpage', error);
        }

        // parse
        pageToJsdom(body, function($, window) {
            if(!$) {
                return cb();
            }
            // get element
            var $slideArea = $('#slide-area');

            // set data
            var data = {};
            data.title = $slideArea.find('.slide-title').html();
            data.content = $slideArea.find('.slide-body').html();

            // free up memory
            window.close();
            // trigger callback
            cb(data);
        });
    });
};

// process function
var process = function(corpus, endCallback) {
    // generate unique url for piece
    var slidewikiId = corpus.input;
    var limit = corpus.input_count;

    // form page url
    var pageUrl = 'http://slidewiki.org/static/deck/' + slidewikiId;
    // get page
    request(pageUrl, function (error, response, body) {
        if (error) {
            return console.log('error loading slidewiki page', error);
        }

        // parse
        parsePage(body, function(res) {
            if(!res) {
                return console.log('error loading slidewiki page', error);
            }
            // get count
            var count = res.length;

            // see what's the smallest number of posts to process
            var max = limit >= count ? count : limit;

            // save posts to db
            var i = 0;
            for(i = 0; i < max; i++){
                var entity = res[i];
                // convert to html string
                var content = '<div class="extracted-title">' + entity.title + '</div> ' + entity.content;
                var doc = {
                    corpuses: [corpus],
                    creation_date: entity.date,
                    uri: entity.link,
                    source: content,
                };
                Article.createNew(doc, function(err, article) {
                    if(err) {
                        return console.log('error saving article', err);
                    }
                });
            }

            // report done
            console.log('done processing wordpress');
            // trigger end callback
            endCallback(corpus);
        });
    });
};

// module
var SlidewikiProcessing = function () {
    // Super constructor
    EventEmitter.call( this );

    // name (also ID of processer used in client)
    this.name = 'slidewiki';

    // function
    this.process = process;

    return this;
};

module.exports = new SlidewikiProcessing();