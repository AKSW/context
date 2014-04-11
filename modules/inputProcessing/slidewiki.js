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

// subpage parser
var parseSubPage = async(function(url) {
    var res = await(request(url));
    var body = res[1];

    // parse
    var $ = cheerio.load(body);
    // get element
    var $slideArea = $('#slide-area');

    // set data
    var data = {};
    data.title = $slideArea.find('.slide-title').html();
    data.content = $slideArea.find('.slide-body').html();

    // trigger callback
    return data;
});

// process page and return entities
var parsePage = async(function(body) {
    // parse
    var $ = cheerio.load(body);

    // form results object
    var results = [];

    // get all posts
    var posts = $('#content ol li');
    posts.each(function(idx, post) {
        var $post = $(post);

        // init entity
        var entity = {};
        // get link
        entity.link = 'http://slidewiki.org/' + $post.find('a').attr('href');
        // process subpage
        var data = await(parseSubPage(entity.link));
        // set data
        entity.title = data.title;
        entity.content = data.content;

        // push entity to results
        results.push(entity);
    });

    return results;
});

// process function
var process = async(function(corpus) {
    // generate unique url for piece
    var slidewikiId = corpus.input;
    var limit = corpus.input_count;
    // init reults
    var results = [];

    // form page url
    var pageUrl = 'http://slidewiki.org/static/deck/' + slidewikiId;
    // get page
    var mainRes = await(request(pageUrl));
    var body = mainRes[1];

    // parse
    var res = await(parsePage(body));
    if(!res) {
        throw new Error('Slidewiki returned no data!');
    }
    // get count
    var count = res.length;

    // save posts to db
    var i = 0;
    var entity;
    for(i = 0; i < count; i++){
        entity = res[i];
        // convert to html string
        var doc = {
            corpuses: [corpus._id],
            uri: entity.link,
            source: entity.content,
            title: entity.title
        };
        results.push(doc);
    }

    return results.slice(0, limit);
});

// module
var SlidewikiProcessing = function () {
    // name (also ID of processer used in client)
    this.name = 'slidewiki';

    // function
    this.process = process;

    return this;
};

module.exports = new SlidewikiProcessing();