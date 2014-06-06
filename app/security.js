var helmet = require('helmet');
var csrf = require('csurf');
var csrfCheck = csrf();
var needCSRF;

var noCSRFlist = [
    '/api/sparql/',
];

var conditionalCSRF = function (req, res, next) {
    needCSRF = true; //default behaviour
    if (req.method === 'POST') {
        if(noCSRFlist.indexOf(req.url) !== -1) {
            needCSRF = false;
        }
    }

    if (needCSRF) {
        return csrfCheck(req, res, next);
    } else {
        return next();
    }
};

module.exports = function(app) {
    app.use(conditionalCSRF);

    // disable powered-by header
    app.disable('x-powered-by');
    // use helmet middleware
    app.use(helmet.xframe());
    app.use(helmet.iexss());
    app.use(helmet.contentTypeOptions());
    app.use(helmet.cacheControl());
};