module.exports = function(app) {
    // logout
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    // register
    app.get('/register', function(req, res) {
        return res.render('register', {error: req.flash('error'), oldData: req.flash('oldData')});
    });
};
