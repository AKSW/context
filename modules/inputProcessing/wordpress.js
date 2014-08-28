// includes
var ProgressReporter = require('../abstract/progressReporter');
var util = require('util');
// async-await fetures
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// promise
var Promise = require('bluebird');
// promisified request
var request = Promise.promisify(require('request'));
// dom stuff
var cheerio = require('cheerio');
// crypto
var crypto = require('crypto');
// logger
var logger = require('../../logger');

// gets post content
var getPostContent = async(function(url) {
    // get resp
    var res = await(request(url));
    var body = res[1];

    // parse
    var $ = cheerio.load(body);
    // get content
    var content = $('.entry-content').html();
    // trigger callback
    return content;
});

// process page and return entities
var parsePage = async(function(body) {
    // parse
    var $ = cheerio.load(body);

    // form results object
    var results = [];

    // get all posts
    var posts = $('.post');
    // var toProcess = posts.length;
    posts.each(function(idx, post) {
        var $entityTitile = $('.entry-title', $(post));
        var $postHeading = $('.postHeading', $(post));
        var $entryMeta = $('.entry-meta', $(post));
        var $postHeader = $('.postHeader', $(post));
        var $entryContent = $('.entry-content', $(post));
        var $moreLink = $entryContent.find('.more-link');
        var $postSummary = $('.postSummary', $(post));
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
        // remove whitespace
        entity.title = entity.title.trim();
        // get link
        entity.link = $entityTitile.find('a').attr('href') ||
                      $entityTitile.attr('href') ||
                      $postHeading.find('a').attr('href') || 'no-link';

        // get date
        var tmpDate = $entryMeta.find('.date').text() ||
                      $entryMeta.find('.entry-date').text() ||
                      $postHeader.find('.postMetaHeader').find('time').attr('datetime') ||
                      '';
        entity.date = new Date(tmpDate.trim()) || '';

        if ($moreLink.length || $postSummary.length) {
            var contentUrl = $moreLink.attr('href') || $postSummary.attr('href');
            var data = await(getPostContent(contentUrl));
            // assign data
            entity.content = data;
            // clean
            entity.content = entity.content.trim().replace(/\t/g, '');

            // if all fails, special case
            if (!entity.content && !entity.title) {
                entity.content = $(post).html();
                // clean
                entity.content = entity.content.trim().replace(/\t/g, '');
            }

            // push
            results.push(entity);
        } else {
            entity.content = $('.entry-content', $(post)).html();

            // if all fails, special case
            if (!entity.content.trim() && !entity.title.trim()) {
                entity.content = $(post).html();
            }

            // push entity to results
            results.push(entity);
        }
    });

    return results;
});

var getNextPage = async(function(url, page) {
    // form url
    var pageUrl = url + '/page/' + page + '/';

    // get resp
    var resp = await(request(pageUrl));
    var body = resp[1];

    // parse
    var res = await(parsePage(body));
    if (!res) {
        logger.error('error loading wp page');
        throw new Error('Error loading wordpress page!');
    }

    // return
    return res;
});

// convert entity to doc
var entityToDocument = function(entity, url, corpus) {
    // if no link is given, generate a new unique one
    if (entity.link === 'no-link') {
        // hash input
        var md5sum = crypto.createHash('md5');
        md5sum.update(entity.content + Date.now().toString());
        // generate unique url for piece
        entity.link = url + 'generated_uri/' + md5sum.digest('hex') + '/' + Date.now();
    }
    var doc = {
        corpuses: [corpus._id],
        creation_date: entity.date,
        dateString: entity.dateString,
        uri: entity.link,
        source: entity.content,
        title: entity.title,
    };
    return doc;
};

// process function
var process = async(function(corpus) {
    var self = this;
    // generate unique url for piece
    var url = corpus.input;
    var limit = corpus.input_count;

    // init results
    var results = [];

    // init page number
    var lastPage = 1;

    // process pages while there are less results than needed
    while (results.length < limit) {
        // get next page
        var res = await(getNextPage(url, lastPage));

        // get count
        var count = res.length;
        var doc;
        for (var i = 0; i < count; i++) {
            doc = entityToDocument(res[i], url, corpus);
            results.push(doc);
        }

        // increase page
        lastPage++;

        // report progress
        self.reportProgress(results.length / limit, corpus._id);
    }

    return results.slice(0, limit);
});

// module
var WordpressProcessing = function () {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'wordpress';

    // function
    this.process = process;

    return this;
};

// Inherit from ProgressReporter
util.inherits(WordpressProcessing, ProgressReporter);

module.exports = new WordpressProcessing();
