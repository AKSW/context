var helmet = require('helmet');
var csrf = require('csurf');
var needCSRF;

module.exports = function(app) {

    var conditionalCSRF = function (req, res, next) {
        needCSRF = true; //default behaviour
        if ((req.method ==="POST") && (req.url ==="/api/sparql")){
            needCSRF = false;
        }

        if (needCSRF == true) {
            return csrf(req, res, next);
        } else {
            return next();
        }
    }
    app.use(conditionalCSRF);

    // disable powered-by header
    app.disable('x-powered-by');
    // use helmet middleware
    app.use(helmet.xframe());
    app.use(helmet.iexss());
    app.use(helmet.contentTypeOptions());
    app.use(helmet.cacheControl());
};
