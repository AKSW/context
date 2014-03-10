var underscore = require('underscore');
var fs = require('fs');
// include db
var Corpus = require('../db/corpus').Corpus;

// array of processers, will be filled automatically
var processers = {};

//
// functions
//

// new corpus creation
var createCorpus = function(corpus, cb) {
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
    console.log('processing input from corpus', corpus);
    // process
    processers[corpus.input_type].process(corpus);
};

// main module object
var CorpusModule = function () {
    // autoload parsing modules
    fs.readdirSync(__dirname + '/inputProcessing').forEach(function(moduleName){
        var obj = require('./inputProcessing/' + moduleName);
        processers[obj.name] = obj;
    });

    this.createCorpus = createCorpus;
};

// export
module.exports = new CorpusModule();