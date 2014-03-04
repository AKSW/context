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

// facebook app config
exports.facebook = {
    clientID: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    callbackURL: 'http://localhost:8080/auth/facebook/callback',
};

// google app config
exports.google = {
    returnURL: 'http://localhost:8080/auth/google/return',
    realm: 'http://localhost:8080/'
};

// google app config
exports.twitter = {
    consumerKey: 'TWITTER_CONSUMER_KEY',
    consumerSecret: 'TWITTER_CONSUMER_SECRET',
    callbackURL: 'http://localhost:8080/auth/twitter/callback'
};
