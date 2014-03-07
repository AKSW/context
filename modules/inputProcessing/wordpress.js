// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var jsdom = require('jsdom');
var crypto = require('crypto');
// db
var Article = require('../../db/article').Article;

var pageToJsdom = function(body, cb) {
    // parse
    jsdom.env({
        html: body,
        scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js'],
        done: function(errors, window) {
            if(errors !== null){
                console.log('jsdom error', errors);
                return cb();
            }

            // get jquery
            var $ = window.$;
            // return
            return cb($, window);
        },
    });
};

// process page and return entities
var parsePage = function(body, itemsLeft, cb) {
    // parse
    pageToJsdom(body, function($, window) {
        if(!$) {
            return cb();
        }

        // form results object
        var results = [];

        // get all posts
        var posts = $('.post');
        var toProcess = posts.length;
        posts.each(function(idx, post) {
            var $entityTitile = $('.entry-title', post);
            var $postHeading = $('.postHeading', post);
            var $entryMeta = $('.entry-meta', post);
            var $postHeader = $('.postHeader', post);
            var $entryContent = $('.entry-content', post);
            var $moreLink = $entryContent.find('.more-link');
            var $postSummary = $('.postSummary', post);
            var $noResults = $(post).hasClass('no-results') ||
                             $(post).hasClass('not-found') ||
                             $(post).hasClass('error404');

            // if no posts, just finish
            if ($noResults) {
                return;
            }

            // init entity
            var entity = {};
            // get title
            entity.title = $entityTitile.html() || $postHeading.html() || '';
            // get link
            entity.link = $entityTitile.find('a').attr('href') ||
                          $entityTitile.attr('href') ||
                          $postHeading.find('a').attr('href') || '';

            // get date
            var tmpDate = $entryMeta.find('.date').text() ||
                          $entryMeta.find('.entry-date').text() ||
                          $postHeader.find('.postMetaHeader').find('time').attr('datetime') ||
                          '';
            entity.date = new Date(tmpDate.trim()) || '';

            if ($moreLink.length || $postSummary.length) {
                var contentUrl = $moreLink.attr('href') || $postSummary.attr('href');
                getPostContent(contentUrl, function(data) {
                    //assign data
                    entity.content = data;

                    // if all fails, special case
                    if (!entity.content.trim() && !entity.title.trim()) {
                        entity.content = $(post).html();
                    }

                    // push
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
            } else {
                entity.content = $('.entry-content', post).html();

                // if all fails, special case
                if (!entity.content.trim() && !entity.title.trim()) {
                    entity.content = $(post).html();
                }

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
            }
        });
    });
};

// gets post content
var getPostContent = function(url, cb) {
    request(url, function (error, response, body) {
        if (error) {
            console.log('error loadgin wp page', error);
            return cb(false);
        }

        // parse
        pageToJsdom(body, function($, window) {
            if(!$) {
                return cb();
            }

            // get content
            var content = $('.entry-content').html();
            // free up memory
            window.close();
            // trigger callback
            cb(content);
        });
    });
};

var getNextPage = function(url, corpus, itemsLeft, page) {
    var pageUrl = url + '/page/'+page+'/';
    request(pageUrl, function (error, response, body) {
        if (error) {
            return console.log('error loadgin wp page', error);
        }

        // parse
        parsePage(body, itemsLeft, function(res) {
            if(!res) {
                return console.log('error loadgin wp page', error);
            }
            // get count
            var count = res.length;

            // see what's the smallest number of posts to process
            var max = itemsLeft >= count ? count : itemsLeft;

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

            // check limit
            itemsLeft -= count;
            if (itemsLeft <= 0) {
                return console.log('done processing wordpress');
            }

            // process next paga
            getNextPage(url, corpus, itemsLeft, page+1);
        });
    });
};

// process function
var process = function(corpus) {
    // generate unique url for piece
    var url = corpus.input;
    var limit = corpus.input_count;

    // get first page
    getNextPage(url, corpus._id, limit, 1);
};

// module
var WordpressProcessing = function () {
    // Super constructor
    EventEmitter.call( this );

    // function
    this.process = process;

    return this;
};

module.exports = new WordpressProcessing();