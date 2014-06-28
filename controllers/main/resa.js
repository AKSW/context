// db
var logger = require('../../logger');

module.exports = function(app) {

    // realtime analysis
    app.get('/resa', function(req, res) {
        return res.render('resa');
    });
};
