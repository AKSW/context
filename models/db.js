// requires
var mongoose = require('mongoose'),
    config = require('../config'),
    db;

// connect
mongoose.connect(config.db);
// init db
db = mongoose.connection;
// log all errors
db.on('error', console.error.bind(console, '[db] connection error:'));

// export
exports.db = db;
