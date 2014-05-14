module.exports = function(app) {
    // export index
    console.log("Ich bin in Article path definer");
    app.get('/article/:id', function(req, res) {
        return res.render('article');
    });
};
