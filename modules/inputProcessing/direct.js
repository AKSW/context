// includes
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');
// db
var Article = require('../../db/article').Article;

// process function
var process = function(corpus) {
    // hash input
    var md5sum = crypto.createHash('md5');
    md5sum.update(corpus.input);
    // generate unique url for piece
    var url = 'direct-input://'+corpus._id.toString()+'/'+md5sum.digest('hex')+'/'+Date.now();

    // convert to html string
    var doc = {
        corpuses: [corpus._id],
        uri: url,
        source: corpus.input,
    };
    Article.createNew(doc, function(err, article) {
        if(err) {
            return console.log('error saving article', err);
        }
    });
};

// module
var DirectProcessing = function () {
    // Super constructor
    EventEmitter.call( this );

    // function
    this.process = process;

    return this;
};

module.exports = new DirectProcessing();