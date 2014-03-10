// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var jsdom = require('jsdom');
var crypto = require('crypto');
var moment = require('moment');
// function requires
var pageToJsdom = require('../../util/jsdom').pageToJsdom;
// db
var Article = require('../../db/article').Article;

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
            var $postTitle = $('.post-title', post);
            var $postTimestamp = $('.post-timestamp', post);
            var $publishDate = $('.publishdate', post);
            var $entryContent = $('.entry-content', post);
            var $postBody = $('.post-body', post);
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
            entity.title = $postTitle.html() || $entityTitile.html() || '';
            // remove whitespace
            entity.title = entity.title.trim();
            // get link
            entity.link = $postTitle.find('a').attr('href') ||
                          $entityTitile.find('a').attr('href') ||
                          'no-link';

            // get date
            var tmpDate = $postTimestamp.find('abbr').attr('title') ||
                          $publishDate.html() ||
                          '';
            entity.dateString = tmpDate;
            entity.date = moment(tmpDate.trim()).toDate() || '';

            // get content
            entity.content = $postBody.html() || $entryContent.html() || '';
            // clean
            entity.content = entity.content.trim();

            // if all fails, special case
            if (!entity.content && !entity.title) {
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
        });
    });
};

var getNextPage = function(url, corpus, itemsLeft, date) {
    var pageUrl = url + '/search?max-results=20';
    if(date) {
        pageUrl += '&updated-max=' + date;
    }
    request(pageUrl, function (error, response, body) {
        if (error) {
            return console.log('error loading blogger page', error);
        }

        // parse
        parsePage(body, itemsLeft, function(res) {
            if(!res) {
                return console.log('error loading blogger page', error);
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
                // if no link is given, generate a new unique one
                if(entity.link === 'no-link') {
                    // hash input
                    var md5sum = crypto.createHash('md5');
                    md5sum.update(content + Date.now().toString());
                    // generate unique url for piece
                    entity.link = url+'generated_uri/'+md5sum.digest('hex')+'/'+Date.now();
                }
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

            // get last item date
            var lastDate = res[res.length-1].dateString;

            // process next paga
            getNextPage(url, corpus, itemsLeft, lastDate);
        });
    });
};

// process function
var process = function(corpus) {
    // generate unique url for piece
    var url = corpus.input;
    var limit = corpus.input_count;

    // get first page
    getNextPage(url, corpus._id, limit);
};

// module
var BloggerProcessing = function () {
    // Super constructor
    EventEmitter.call( this );

    // name (also ID of processer used in client)
    this.name = 'blogger';

    // function
    this.process = process;

    return this;
};

module.exports = new BloggerProcessing();