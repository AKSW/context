module.exports = function(app) {
    // export index
    app.get('/article/:id', function(req, res) {
        return res.render('article');

    });
};
