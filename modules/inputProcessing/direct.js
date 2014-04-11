// includes
var async = require('asyncawait/async');
var crypto = require('crypto');

// process function
var process = async(function(corpus) {
    // hash input
    var md5sum = crypto.createHash('md5');
    md5sum.update(corpus.input);
    // generate unique url for piece
    var url = 'direct-input://'+corpus._id.toString()+'/'+md5sum.digest('hex')+'/'+Date.now();

    // convert to html string
    var doc = {
        corpuses: [corpus._id],
        uri: url,
        source: corpus.input
    };

    return [doc];
});

// module
var DirectProcessing = function () {
    // name (also ID of processer used in client)
    this.name = 'directinput';

    // function
    this.process = process;

    return this;
};

module.exports = new DirectProcessing();