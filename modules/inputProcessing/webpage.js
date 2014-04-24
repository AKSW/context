// includes
var EventEmitter = require('events').EventEmitter;
var util = require('util');
// async-await fetures
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// promise
var Promise = require('bluebird');
// promisified request
var request = Promise.promisify(require('request'));

// process function
var process = async(function(corpus) {
    // get url
    var url = corpus.input;

    // get content
    var res = await(request(url));
    var body = res[1];

    // convert to html string
    var doc = {
        corpuses: [corpus._id],
        uri: url,
        source: body,
    };

    return [doc];
});

// module
var WebpageProcessing = function () {
    // name (also ID of processer used in client)
    this.name = 'webpage';

    // function
    this.process = process;

    return this;
};

// Inherit from EventEmitter
util.inherits(WebpageProcessing, EventEmitter);

module.exports = new WebpageProcessing();