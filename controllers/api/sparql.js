module.exports = function(app) {
    // export captcha image
    app.post('/api/sparql', function(req, res) {
        return res.send('ok');
    });
};
