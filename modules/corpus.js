// websocket server
var WebSocketServer = require('ws').Server;
// async-await fetures
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// async.js
var asyncUtil = require('async');
// filesystem stuff
var fs = require('fs');
// string.js
var S = require('string');
// lodash
var _ = require('lodash');
// include db
var Corpus = require('../models').Corpus;
var Article = require('../models').Article;
// logger
var logger = require('../logger');
// config
var config = require('../config');

// dict of processers, will be filled automatically
var inputProcessers = {};
// dict of annotation services, will be filled automatically
var annotationServices = {};
// dict of websocket progress services
var progressServices = {};
var progressClients = {};

//
// private functions
//

//
// WebSocket-based progress reporting server
//

var closeWebSocket = function(corpus) {
    var wss = progressServices[corpus._id];
    logger.info('closing websocket', corpus._id);
    if(wss) {
        // close all connections
        wss.close();
        // dispose of the object
        wss = null;
    }

    // reset value in dics
    delete progressServices[corpus._id];

    // clean clients
    var clients = progressClients[corpus._id];
    // close all if exist
    if(clients) {
        clients.forEach(function(client) {
            client.close();
        });
    }
    // reset value
    delete progressClients[corpus._id];
};

var initWebSocket = function(corpus) {
    // construct url
    var socketURL = 'ws://' + config.defaultHost + ':' + config.defaultSocketPort + '/corpus/' + corpus._id;
    // close old socket if exists
    closeWebSocket(corpus);
    // log opening
    logger.info('Starting progress socket at: ', socketURL);
    // init server
    var wss = new WebSocketServer({
        //host: config.defaultHost,
        port: config.defaultSocketPort,
        path: '/corpus/' + corpus._id
    });
    // init clients array
    progressClients[corpus._id] = [];
    // assign events
    wss.on('connection', function(ws) {
        // store client if needed
        progressClients[corpus._id].push(ws);
        // add event listeners
        ws.on('close', function() {
            if(progressClients[corpus._id]) {
                // remove from array
                var ind = progressClients[corpus._id].indexOf(ws);
                if(ind !== -1) {
                    progressClients[corpus._id].splice(ind, 1);
                }
            }
        });
    });
    // push to services collection
    progressServices[corpus._id] = wss;
};

var reportProgress = function(corpusId, type, progress) {
    logger.info('reporting progress info', corpusId, type, progress);
    // normalize progress
    if(progress > 1.0) {
        progress = 1.0;
    }
    // get clients
    var clients = progressClients[corpusId];
    // if any
    if(clients) {
        // send data to all
        clients.forEach(function(ws) {
            ws.send(JSON.stringify({
                type: type,
                progress: progress
            }));
        });
    }
};

//
// Annotation logic
//

var annotateArticle = function(article, corpus, callback) {
    // define handler function that will call callback once done
    var handleSaveError = function(err) {
        if(err) {
            logger.error('error updating article', article, err);
            return callback(false);
        }
        return callback();
    };

    // get plain text
    var sourceText = S(article.title + '. ' + article.source).stripTags().s;
    if(!annotationServices[corpus.nlp_api]) {
        logger.error('error! annotation service not found!', corpus);
        return;
    }
    // check if source is valid
    if(sourceText && sourceText.length > 0) {
        // start input processing
        annotationServices[corpus.nlp_api]
        .process(sourceText)
        .then(function(result) {
            var data = _.extend(result, {processed: true});
            article.update(data, handleSaveError);
        })
        .catch(function(err) {
            logger.error('error getting annotation from service', err);
            return callback(false);
        });
    } else {
        article.update({processed: true, annotation: ''}, handleSaveError);
    }
};

var annotateCorpus = function(corpus) {
    // find all not processed articles for current corpus
    Article.find({corpuses: corpus._id, processed: false}, function(err, articles) {
        if(err) {
            return logger.error('error getting articles for annotation', err);
        }

        // log
        logger.info('preparing to annotate', articles.length, corpus._id);
        // init array of functions to run
        var toRun = [];
        var annotated = 0;

        // process
        articles.forEach(function(item){
            // add to parallel execution queue
            toRun.push(function(callback) {
                annotateArticle(item, corpus, function(res) {
                    annotated++;
                    reportProgress(corpus._id, 'annotation', annotated / articles.length);
                    callback(res);
                });
            });
        });

        // wait for all to finish
        asyncUtil.parallel(toRun, function(res) {
            logger.info('all annotation done', corpus._id, res);
            // update corpus
            corpus.update({processed: true}, function(err) {
                if(err) {
                    logger.error('error updating corpus!', err);
                }
            });
            // close websocket server
            closeWebSocket(corpus);
        });
    });
};

var processCorpus = function(corpus) {
    logger.info('starting to process input from corpus', corpus._id);
    if(inputProcessers[corpus.input_type]) {
        // start input processing
        inputProcessers[corpus.input_type]
        .process(corpus)
        .then(async(function(res) {
            var i, len = res.length, item;
            for(i = 0; i < len; i++){
                item = res[i];
                var resp = await(Article.createNew(item));
            }

            annotateCorpus(corpus);
        }))
        .catch(function(err) {
            logger.error('error processing corpus input!', corpus, err);
        });
    } else {
        logger.error('error! corpus processer not found!');
    }
};

//
// Progress tracking
//

var onInputProgress = function(data) {
    reportProgress(data.corpus, 'input', data.progress);
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
            logger.error('error saving new corpus', err);
            return cb(err, null);
        }

        // step 2: init websocket server for progress reporting
        initWebSocket(newCorpus);

        // step 3: detect input type and get corresponding module
        processCorpus(newCorpus);

        // return corpus ID to sender for redirect
        cb(null, newCorpus._id);
    });
};

// main module object
var CorpusModule = function () {
    // autoload input parsing modules
    fs.readdirSync(__dirname + '/inputProcessing').forEach(function(moduleName){
        // get service
        var obj = require('./inputProcessing/' + moduleName);
        // assign progress event listener
        obj.on('progress', onInputProgress);
        // push to dict
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
