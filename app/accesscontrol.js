module.exports = function(app) {
    // check for auth in every request
    app.all('*', function(req,res,next) {
        var unauthNotAllowedRoutes = ['/hub'],
            url = req.url.split('?')[0];

        // if route is allowed w/o reg
        if(unauthNotAllowedRoutes.indexOf(url) === -1) {
            return next();
        }

        // if authed - continue
        if(req.user) {
            return next();
        } else {
            return res.redirect('/');
        }
    });
};
