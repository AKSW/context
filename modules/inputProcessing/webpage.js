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
        title: 'Content of ' + url,
    };

    return [doc];
});

// module
var WebpageProcessing = function () {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'webpage';

    // function
    this.process = process;

    return this;
};

// Inherit from ProgressReporter
util.inherits(WebpageProcessing, ProgressReporter);

module.exports = new WebpageProcessing();
