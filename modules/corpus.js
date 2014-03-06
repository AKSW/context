// include db
var Corpus = require('../db/corpus').Corpus;

//
// functions
//

// new corpus creation
var createCorpus = function(corpus, inputCount) {
    console.log('processing corpus', corpus, inputCount);
    // step 1: save corpus to db
    // step 2: detect input type and get corresponding module
    // step 3: await module response
};

// main module object
var CorpusModule = function () {
    this.createCorpus = createCorpus;
};

// export
module.exports = new CorpusModule();