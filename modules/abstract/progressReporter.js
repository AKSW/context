// includes
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// module
var ProgressReporter = function () {
    EventEmitter.call(this);

    // progress reporting function
    this.reportProgress = function (progress, corpus) {
        this.emit('progress', {
            progress: progress,
            corpus: corpus
        });
    };

    return this;
};


// Inherit from EventEmitter
util.inherits(ProgressReporter, EventEmitter);

module.exports = ProgressReporter;