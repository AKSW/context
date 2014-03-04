// if debug is enabled
exports.debug = false;

// cookies stuff
exports.sidSalt = 'initMe';
exports.cookieParserSalt = 'initMeToo';
exports.cookieSecret = 'andMeToo';

// default app port
exports.defaultPort = 8080;

// default db
exports.db = 'mongodb://localhost/context';

// session config
exports.sessionDb = {
    url: exports.db
};

// facebook config
exports.facebook = {
    clientID: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    callbackURL: 'http://localhost:8080/auth/facebook/callback',
};
