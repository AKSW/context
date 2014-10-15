// includes
var ProgressReporter = require('../abstract/progressReporter');
var util = require('util');
// async stuff
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// crypto
var crypto = require('crypto');
// promise
var Promise = require('bluebird');
// fs
var fs = require('fs');
// promisified readfile
var readFile = Promise.promisify(fs.readFile);
// logger
// var logger = require('../../logger');

// process function
var process = async(function(corpus) {
    // generate unique url for piece
    var urlBase = 'upload-file:///' + corpus._id.toString() + '/';

    // init results
    var results = [];

    // get files
    var files = corpus.files;
    var file;

    // process files
    for (var i = 0; i < files.length; i++) {
        file = files[i];
        var data = await(readFile(file.path, 'utf8'));

        // hash input
        var md5sum = crypto.createHash('md5');
        md5sum.update(file.name);
        // generate unique url for piece
        var url = urlBase + md5sum.digest('hex') + '/' + Date.now();

        // push to results
        results.push({
            corpuses: [corpus._id],
            uri: url,
            source: data,
            title: file.name,
        });
    }

    return results;
});

// module
var FilesProcessing = function() {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'doc';

    // function
    this.process = process;

    return this;
};

// Inherit from ProgressReporter
util.inherits(FilesProcessing, ProgressReporter);

module.exports = new FilesProcessing();
