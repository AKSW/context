
// export index
exports.index = {
    path: '/',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('index', {error: req.flash('error'), oldusername: req.flash('oldusername')});
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
