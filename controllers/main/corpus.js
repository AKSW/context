module.exports = function(app) {
    // export index
    app.get('/corpus/:id', function(req, res) {
        return res.render('corpus');
    });

    app.get('/corpus/:id/*', function(req, res) {
        return res.render('corpus');
    });
};
