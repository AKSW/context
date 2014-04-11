// includes
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


// process page and return entities
var parsePage = function(body, username) {
    // parse
    var $ = cheerio.load(body);

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

    // trigger callback
    return results;
};


var getNextPage = async(function(username, lastId, corpus) {
    // form url
    var pageUrl = 'https://twitter.com/i/profiles/show/'+username+'/timeline/with_replies?include_available_features=1&include_entities=1';
    // append lastid if given
    if(lastId) {
        pageUrl += '&max_id='+lastId+'&oldest_unread_id=0';
    }

    // get res
    var pageRes = await(request(pageUrl));
    var body = pageRes[1];
    // get html piece
    body = JSON.parse(body).items_html;
    // form proper html
    body = '<html><body>' + body + '</body></html>';

    // parse
    var res = parsePage(body, username);
    if(!res) {
        console.log('error loading twitter page');
        throw new Error('Error loading twitter page!');
    }
    var results = [];
    // get count
    var count = res.length;

    // save posts to db
    var entity;
    var i = 0;
    for(i = 0; i < count; i++){
        entity = res[i];
        // convert to html string
        var doc = {
            corpuses: [corpus._id],
            creation_date: entity.date,
            uri: entity.link,
            source: entity.content,
        };
        results.push(doc);
    }

    return results;
});

// process function
var process = async(function(corpus) {
    // get username
    var username = corpus.input;
    var limit = corpus.input_count;
    // init results
    var results = [];

    // if username is url, get username part
    if(username.indexOf('twitter.') !== -1){
        username = username.split('twitter.com/')[1];
    }

    // process pages while there are less results than needed
    while(results.length < limit) {
        // get last item date
        var lastId = results.length > 0 ? results[results.length-1].id : null;

        // get next page
        var res = await(getNextPage(username, lastId, corpus));

        // get count
        var count = res.length;
        var i;
        for(i = 0; i < count; i++){
            results.push(res[i]);
        }
    }

    // start processing
    return results;
});

// module
var TwitterProcessing = function () {
    // name (also ID of processer used in client)
    this.name = 'twitter';

    // function
    this.process = process;

    return this;
};

module.exports = new TwitterProcessing();