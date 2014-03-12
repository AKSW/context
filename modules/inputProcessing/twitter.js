// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var jsdom = require('jsdom');
var crypto = require('crypto');
// function requires
var pageToJsdom = require('../../util/jsdom').pageToJsdom;
// db
var Article = require('../../db/article').Article;


// process page and return entities
var parsePage = function(body, username, itemsLeft, cb) {
    // parse
    pageToJsdom(body, function($, window) {
        if(!$) {
            return cb();
        }

        // form results object
        var results = [];

        // get all posts
        var posts = $('li');
        posts.each(function(idx, post) {
            var $post = $(post);

            // init entity
            var entity = {};
            // get id
            var id = $post.attr('data-item-id');
            // do not continue if item has no id
            if(!id) {
                return;
            }

            // set id
            entity.id = id;
            // get link
            entity.link = 'http://twitter.com/' + username + '/statuses/' + $post.attr('data-item-id');

            // get date
            var tmpDate = $post.find('.time').find('._timestamp').attr('data-time');
            entity.dateString = tmpDate.trim();
            entity.date = new Date(entity.dateString) || '';

            // get content
            entity.content = $post.find('.tweet-text').html();
            // clean
            entity.content = entity.content.trim();

            // push entity to results
            results.push(entity);
        });

        // free up memory
        window.close();
        // trigger callback
        cb(results);
    });
};


var getNextPage = function(username, corpus, itemsLeft, lastId, endCallback) {
    var pageUrl = 'https://twitter.com/i/profiles/show/'+username+'/timeline/with_replies?include_available_features=1&include_entities=1';
    if(lastId) {
        pageUrl += '&max_id='+lastId+'&oldest_unread_id=0';
    }
    request(pageUrl, function (error, response, body) {
        if (error) {
            return console.log('error loading twitter page', error);
        }

        // get html piece
        body = JSON.parse(body).items_html;
        // form proper html
        body = '<html><body>' + body + '</body></html>';

        // parse
        parsePage(body, username, itemsLeft, function(res) {
            if(!res) {
                return console.log('error loading twitter page', error);
            }
            // get count
            var count = res.length;

            // see what's the smallest number of posts to process
            var max = itemsLeft >= count ? count : itemsLeft;
            var toSave = max;

            // save posts to db
            var i = 0;
            for(i = 0; i < max; i++){
                var entity = res[i];
                // convert to html string
                var content = entity.content+'<meta name="url" content="'+entity.url+'"><meta name="timestamp" content="'+entity.dateString+'">';
                var doc = {
                    corpuses: [corpus._id],
                    creation_date: entity.date,
                    uri: entity.link,
                    source: content,
                };
                Article.createNew(doc, function(err, article) {
                    if(err) {
                        return console.log('error saving article', err);
                    }

                    // decrease to process counter
                    toSave--;
                    // check end
                    if(toSave === 0) {
                        // check limit
                        itemsLeft -= count;
                        if (itemsLeft <= 0) {
                            console.log('done processing twitter');
                            return endCallback(corpus);
                        }

                        // get last item id
                        var nextLastId = res[res.length-1].id;

                        // process next paga
                        getNextPage(username, corpus, itemsLeft, nextLastId, endCallback);
                    }
                });
            }
        });
    });
};

// process function
var process = function(corpus, endCallback) {
    // get username
    var username = corpus.input;
    var limit = corpus.input_count;

    // if username is url, get username part
    if(username.indexOf('twitter.') !== -1){
        username = username.split('twitter.com/')[1];
    }

    // start processing
    getNextPage(username, corpus, limit, null, endCallback);
};

// module
var TwitterProcessing = function () {
    // Super constructor
    EventEmitter.call( this );

    // name (also ID of processer used in client)
    this.name = 'twitter';

    // function
    this.process = process;

    return this;
};

module.exports = new TwitterProcessing();