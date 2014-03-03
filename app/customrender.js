var config = require('../config');

module.exports = function(app) {
    // locals
    app.use(function(req, res, next) {
        var render = res.render;
        res.render = function(view, locals, cb) {
            if (typeof locals === 'object') {
                locals.debug = config.debug;
                locals.user = req.user;
            }
            if (locals === undefined) {
                locals = {
                    debug: config.debug,
                    user: req.user,
                };
            }
            console.log(locals.user);
            render.call(res, view, locals, cb);
        };
        next();
    });
};
