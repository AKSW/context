// logger
var logger = require('../logger');
// config
var config = require('../config');

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


var reportNewTweet = function(tweet) {
    //logger.info('reporting new tweet');

    // get clients
    var clients = progressClients;
    // if any
    if(clients) {
        // send data to all
        clients.forEach(function(ws) {
            ws.send(JSON.stringify({
                id: tweet.id,
                text: tweet.text,
                date: tweet.created_at
            }));
        });
    }
};

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
            reportNewTweet(tweet);
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
    this.startAnalysis = startAnalysis;
    this.stopAnalysis = stopAnalysis;
};

// export
module.exports = new ResaModule();
