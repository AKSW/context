// if debug is enabled
exports.debug = false;

// cookies stuff
exports.sidSalt = 'initMe';
exports.cookieParserSalt = 'initMeToo';
exports.cookieSecret = 'andMeToo';

// password salt
exports.passwordSalt = 'ThisIsPasswordSalt';

// default app port
exports.defaultPort = 8080;
// default websockets port
exports.defaultSocketPort = 8081;
// default app uri (needed for websocket server)
exports.defaultHost = 'localhost';

// default db
exports.db = 'mongodb://localhost/context';
exports.rdfbackendSettings = {persistent:true,
    engine:'mongodb',
    name:'rdfbackend', // quads in MongoDB will be stored in a DB named myappstore
    overwrite:false,    // delete all the data already present in the MongoDB server
    mongoDomain:'localhost', // location of the MongoDB instance, localhost by default
    mongoPort:27017 // port where the MongoDB server is running, 27017 by default
}
// session config
exports.sessionDb = {
    url: exports.db
};

//RDF Backend
exports.rdfbackend ={
    nifexport: true,
    nifsave: true,
    sparqlendpoint: true,
    sparqlUpdateOperations: false,
    baseuri : "http://127.0.0.1:8080/context"
}
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

// twitter app config
exports.twitter = {
    consumerKey: 'TWITTER_CONSUMER_KEY',
    consumerSecret: 'TWITTER_CONSUMER_SECRET',
    callbackURL: 'http://localhost:8080/auth/twitter/callback'
};

// linkedin app config
exports.linkedin = {
    consumerKey: 'LINKEDIN_API_KEY',
    consumerSecret: 'LINKEDIN_SECRET_KEY',
    callbackURL: 'http://localhost:8080/auth/linkedin/callback'
};
