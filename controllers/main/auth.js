// logout
exports.logout = {
    path: '/logout',
    method: 'get',
    returns: function(req, res, next){
        req.logout();
        res.redirect('/');
    }
};
