var config = require('../config');

module.exports = function(app) {
    // locals
    app.use(function(req, res, next) {
        var render = res.render;
        res.render = function(view, locals, cb) {
            if (typeof locals === 'object') {
                locals.debug = config.debug;
            }
            if (locals === undefined) {
                locals = { debug: config.debug };
            }
            render.call(res, view, locals, cb);
        };
        next();
    });
};
