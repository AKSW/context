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
// date-time manipulations
var moment = require('moment');
// logger
var logger = require('../../logger');

// process page and return entities
var parsePage = function(body) {
    // parse
    var $ = cheerio.load(body);

    // form results object
    var results = [];

    // get all posts
    var posts = $('.post');
    posts.each(function(idx, post) {
        var $entityTitile = $('.entry-title', $(post));
        var $postTitle = $('.post-title', $(post));
        var $postTimestamp = $('.post-timestamp', $(post));
        var $publishDate = $('.publishdate', $(post));
        var $entryContent = $('.entry-content', $(post));
        var $postBody = $('.post-body', $(post));
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
    });

    // trigger callback
    return results;
};

var getNextPage = async(function(url, date) {
    // form url
    var pageUrl = url + '/search?max-results=20';
    // append date if needed
    if(date) {
        pageUrl += '&updated-max=' + date;
    }

    // get page
    var resp = await(request(pageUrl));
    var body = resp[1];

    // parse
    var res = parsePage(body);
    if(!res) {
        logger.error('error loading blogger page');
        throw new Error('Error loadin blogger page!');
    }

    return res;
});

// convert entity to doc
var entityToDocument = function(entity, url, corpus) {
    // if no link is given, generate a new unique one
    if(entity.link === 'no-link') {
        // hash input
        var md5sum = crypto.createHash('md5');
        md5sum.update(entity.content + Date.now().toString());
        // generate unique url for piece
        entity.link = url+'generated_uri/'+md5sum.digest('hex')+'/'+Date.now();
    }
    var doc = {
        corpuses: [corpus._id],
        creation_date: entity.date,
        dateString: entity.dateString,
        uri: entity.link,
        source: entity.content,
        title: entity.title,
        language: corpus.language,
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

    // process pages while there are less results than needed
    while(results.length < limit) {
        // get last item date
        var lastDate = results.length > 0 ? results[results.length-1].dateString : null;

        // get next page
        var res = await(getNextPage(url, lastDate));

        // get count
        var count = res.length;
        var i, doc;
        for(i = 0; i < count; i++){
            doc = entityToDocument(res[i], url, corpus);
            results.push(doc);
        }

        // report progress
        self.reportProgress(results.length / limit, corpus._id);
    }

    return results.slice(0, limit);
});

// module
var BloggerProcessing = function () {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'blogger';

    // function
    this.process = process;

    return this;
};

// Inherit from ProgressReporter
util.inherits(BloggerProcessing, ProgressReporter);

module.exports = new BloggerProcessing();
