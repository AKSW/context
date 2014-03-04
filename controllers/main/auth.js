// logout
exports.logout = {
    path: '/logout',
    method: 'get',
    returns: function(req, res, next){
        req.logout();
        res.redirect('/');
    }
};

// export index
exports.register = {
    path: '/register',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('register', {error: req.flash('error'), oldData: req.flash('oldData')});
    }
};
