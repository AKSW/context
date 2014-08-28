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
// var crypto = require('crypto');

// process page and return entities
var parsePage = function(body, username) {
    // parse
    var $ = cheerio.load(body);

    // form results object
    var results = [];

    // get all posts
    // assume we're using old profile first
    var posts = $('li[data-item-type="tweet"]');
    var isOldProfile = true;
    // if no result returned, try working as with new profile
    if (!posts.length) {
        isOldProfile = false;
        posts = $('div[data-item-type="tweet"]');
    }
    // process posts
    posts.each(function(idx, post) {
        var $post = $(post);

        // init entity
        var entity = {};
        // get id
        var id = $post.attr('data-item-id');
        // do not continue if item has no id
        if (!id) {
            return;
        }

        // set id
        entity.id = id;
        // get link
        entity.link = 'http://twitter.com/' + username + '/statuses/' + id;

        // get date
        var tmpDate = isOldProfile ?
            $post.find('.time').find('._timestamp').attr('data-time') :
            $post.find('.ProfileTweet-timestamp').find(
                '.js-short-timestamp').attr('data-time');
        entity.dateString = tmpDate.trim();
        entity.date = new Date(entity.dateString) || '';

        // get content
        entity.content = isOldProfile ?
            $post.find('.tweet-text').html() : $post.find(
                '.ProfileTweet-text').html();
        // clean
        entity.content = entity.content.trim();
        // generate title
        entity.title = entity.content.slice(0, 30);

        // push entity to results
        results.push(entity);
    });

    // trigger callback
    return results;
};

var getNextPage = async(function(username, lastId, corpus) {
    // form url
    var pageUrl = 'https://twitter.com/i/profiles/show/' + username +
        '/timeline/with_replies?include_available_features=1&include_entities=1';
    // append lastid if given
    if (lastId) {
        pageUrl += '&max_id=' + lastId + '&oldest_unread_id=0';
    }

    // get res
    var pageRes = await(request(pageUrl));
    var body = pageRes[1];
    // get html piece
    body = JSON.parse(body).items_html;

    // parse
    var res = parsePage(body, username);
    if (!res) {
        throw new Error('Error loading twitter page!');
    }
    var results = [];
    // get count
    var count = res.length;

    // save posts to db
    var entity;
    var i = 0;
    for (i = 0; i < count; i++) {
        entity = res[i];
        // convert to html string
        var doc = {
            item_id: entity.id,
            corpuses: [corpus._id],
            creation_date: entity.date,
            uri: entity.link,
            source: entity.content,
            title: entity.title,
        };
        results.push(doc);
    }

    return results;
});

// process function
var process = async(function(corpus) {
    var self = this;
    // get username
    var username = corpus.input;
    var limit = corpus.input_count;
    // init results
    var results = [];

    // if username is url, get username part
    if (username.indexOf('twitter.') !== -1) {
        username = username.split('twitter.com/')[1];
    }

    // process pages while there are less results than needed
    while (results.length < limit) {
        // get last item date
        var lastId = results.length > 0 ? results[results.length - 1].item_id :
            null;

        // get next page
        var res = await(getNextPage(username, lastId, corpus));

        // get count
        var count = res.length;
        var i;
        for (i = 0; i < count; i++) {
            results.push(res[i]);
        }

        // report progress
        self.reportProgress(results.length / limit, corpus._id);
    }

    // start processing
    return results.slice(0, limit);
});

// module
var TwitterProcessing = function() {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'twitter';

    // function
    this.process = process;

    return this;
};

// Inherit from ProgressReporter
util.inherits(TwitterProcessing, ProgressReporter);

module.exports = new TwitterProcessing();
