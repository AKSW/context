
// export index
exports.index = {
    path: '/',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('index', {error: req.flash('error'), oldusername: req.flash('oldusername')});
    }
};


// export profile
exports.profile = {
    path: '/profile',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('profile', {error: req.flash('error'), success: req.flash('success')});
    }
};

