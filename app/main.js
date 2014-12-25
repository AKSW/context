var flash = require('connect-flash');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');

module.exports = function(app) {
    // use flash messaging
    app.use(flash());

    // parse request bodies (req.body)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // support _method (PUT in forms etc)
    app.use(methodOverride());
    //use middleware compression to network traffic optimization
    app.use(compression());
};
