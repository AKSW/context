var underscore = require('underscore');
// include db
var Corpus = require('../db/corpus').Corpus;

//
// functions
//

// new corpus creation
var createCorpus = function(corpus, cb) {
    console.log('creating new corpus', corpus);
    // step 1: save corpus to db
    var newCorpus = new Corpus(corpus);
    newCorpus.save(function(err) {
        if(err) {
            console.log('error saving new corpus', err);
            return cb(err, null);
        }

        console.log(newCorpus);
        // step 2: detect input type and get corresponding module
        processCorpus(newCorpus);

        // return corpus ID to sender for redirect
        cb(null, newCorpus._id);
    });
};

var processCorpus = function(corpus) {
    console.log('processing input from corpus ', corpus);
    // step 3: await module response
};

// main module object
var CorpusModule = function () {
    this.createCorpus = createCorpus;
};

// export
module.exports = new CorpusModule();