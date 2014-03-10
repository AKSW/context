var underscore = require('underscore');
var fs = require('fs');
// include db
var Corpus = require('../db/corpus').Corpus;

// dict of processers, will be filled automatically
var inputProcessers = {};
// dict of annotation services, will be filled automatically
var annotationServices = {};

//
// private functions
//

var processCorpus = function(corpus) {
    console.log('starting to process input from corpus', corpus);
    // start input processing
    inputProcessers[corpus.input_type].process(corpus, annotateCorpus);
};

var annotateCorpus = function(corpus) {
    console.log('starting to annotate corpus', corpus);
    // start input processing
    //inputProcessers[corpus.input_type].process(corpus);
};



//
// public functions
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

// main module object
var CorpusModule = function () {
    // autoload input parsing modules
    fs.readdirSync(__dirname + '/inputProcessing').forEach(function(moduleName){
        var obj = require('./inputProcessing/' + moduleName);
        inputProcessers[obj.name] = obj;
    });

    // autoload annotation modules
    fs.readdirSync(__dirname + '/annotationServices').forEach(function(moduleName){
        var obj = require('./annotationServices/' + moduleName);
        annotationServices[obj.name] = obj;
    });

    // expose create function
    this.createCorpus = createCorpus;
};

// export
module.exports = new CorpusModule();