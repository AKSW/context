//change it for using other NLP service
var default_nlp_api="DBpedia-Spotlight";
// logger
var logger = require('../logger');
// config
var config = require('../config');
// async-await features
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
//twitter API
var twitter = require('ntwitter');
var twit = new twitter({
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: config.twitter.accessTokenKey,
    access_token_secret: config.twitter.accessTokenSecret
});
//global variable to toggle streams
var stop_streaming=0;
// websocket server
var WebSocketServer = require('ws').Server;
var progressService;
var progressClients = [];
var annotationServices = {};

//
// private functions
//

//
// WebSocket-based progress reporting server
//

var closeWebSocket = function() {
    logger.info('closing websocket');
    var wss = progressService;
    if(wss) {
        // close all connections
        wss.close();
        // dispose of the object
        wss = null;
    }
    delete progressService;
    // clean clients
    var clients = progressClients;
    // close all if exist
    if(clients) {
        clients.forEach(function(client) {
            client.close();
        });
    }
    // reset value
    delete progressClients;
};

var initWebSocket = function() {
    // construct url
    var socketURL = 'ws://' + config.defaultHost + ':' + config.defaultSocketPort + '/resa';
    // close old socket if exists
    //closeWebSocket(corpus);
    // log opening
    logger.info('Starting progress socket at: ', socketURL);
    // init server
    var wss = new WebSocketServer({
        //host: config.defaultHost,
        port: config.defaultSocketPort,
        path: '/resa'
    });

    // assign events
    wss.on('connection', function(ws) {
        logger.info('A client connected!');
        progressClients.push(ws);
        // add event listeners
        ws.on('close', function() {
            if(progressClients.length) {
                // remove from array
                var ind = progressClients.indexOf(ws);
                if(ind !== -1) {
                    progressClients.splice(ind, 1);
                }
            }
        });
    });
    progressService = wss;
};


var reportAnalysisResult = function(tweet,result) {
   var entities=[];
    if(result.entities !=undefined){
        _.forEach(result.entities, function(entity){
            entities.push({name:entity.name, uri:entity.uri, types:entity.types,offset:entity.offset});
            logger.info(entity.uri);
        })
    }
    var output=  {
        id: tweet.id,
        text: tweet.text,
        date: tweet.created_at,
        entities:entities
    }

    // get clients
    var clients = progressClients;
    // if any
    if(clients) {
        // send data to all
        clients.forEach(function(ws) {
            ws.send(JSON.stringify(output));
        });
    }
};

var annotate= function(nlp_api, tweet){
    if(!annotationServices[nlp_api]) {
        logger.error('error! annotation service not found!', corpus);
        return;
    }
    // start input processing
    annotationServices[nlp_api]
        .process(tweet.text)
        .then(function(result) {
            //logger.info(result);
            reportAnalysisResult(tweet,result);
        })
        .catch(function(err) {
            logger.error('error getting annotation from service', err);
            return callback(false);
        });

}

//
// public functions
//

// new corpus creation
var startAnalysis = function(keyword) {
    initWebSocket();
    stop_streaming=0;
    logger.info('Started Analysis:',keyword);

    twit.stream('statuses/filter', { track: keyword}, function(stream) {
        stream.on('data', function(tweet) {
            if(stop_streaming){
                stream.destroy();
            }
            annotate(default_nlp_api, tweet);
            //logger.info(tweet.text);
        });

    });
};
var stopAnalysis = function() {
    logger.info('Stopped Analysis');
    stop_streaming=1;
    closeWebSocket();
};

// main module object
var ResaModule = function () {
    // autoload annotation modules
    fs.readdirSync(__dirname + '/annotationServices').forEach(function(moduleName){
        var obj = require('./annotationServices/' + moduleName);
        annotationServices[obj.name] = obj;
    });
    this.startAnalysis = startAnalysis;
    this.stopAnalysis = stopAnalysis;
};

// export
module.exports = new ResaModule();
