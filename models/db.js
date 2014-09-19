// requires
var mongoose = require('mongoose');
var mongolastic = require('mongolastic');
var config = require('../config');
var logger = require('../logger');
var db;

// connect
mongoose.connect(config.db);
// init db
db = mongoose.connection;
// log all errors
db.on('error', logger.error.bind(logger, '[db] connection error:'));

//mongolastic connection
mongolastic.connect('context',{host:config.elasticHost},function(err){ //TODO: set requestTimeout > 1000ms, if needed
    if (err) console.log('mongolastic '+err);
    else console.log('mongolastic connected');
});

// export
module.exports = db;
