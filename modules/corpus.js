var underscore = require('underscore');
var fs = require('fs');
var S = require('string');
var _ = require('underscore');
// include db
var Corpus = require('../db/corpus').Corpus;
var Article = require('../db/article').Article;

// dict of processers, will be filled automatically
var inputProcessers = {};
// dict of annotation services, will be filled automatically
var annotationServices = {};

//
// private functions
//

var handleSaveError = function(err) {
    if(err) {
        return console.log('error updating article', err);
    }
};

var annotateArtice = function(article, corpus) {
    // get plain text
    var sourceText = S(article.source).stripTags().s;
    // check if source is valid
    if(sourceText && sourceText.length > 0) {
        // start input processing
        annotationServices[corpus.nlp_api].process(sourceText, function(err, result) {
            if(err) {
                return console.log('error getting annotation from service', err);
            }

            var data = _.extend(result, {processed: true});
            article.update(data, handleSaveError);
        });
    } else {
        article.update({processed: true, annotation: ''}, handleSaveError);
    }
};

var annotateCorpus = function(corpus) {
    // find all not processed articles for current corpus
    Article.find({corpuses: corpus._id, processed: false}, function(err, articles) {
        if(err) {
            return console.log('error gettin articles for annotation', err);
        }
        // process
        articles.forEach(function(item){
            annotateArtice(item, corpus);
        });
    });
};

var processCorpus = function(corpus) {
    console.log('starting to process input from corpus', corpus._id);
    // start input processing
    inputProcessers[corpus.input_type].process(corpus, annotateCorpus);
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