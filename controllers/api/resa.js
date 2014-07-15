
var Resa = require('../../modules/resa');
// export routes
module.exports = function(app) {

    app.get('/api/resa/start/:keyword', function(req, res, next){
        var keyword = req.params.keyword;
        Resa.startAnalysis(keyword);
        return res.send('Started Analysis: '+keyword);
    });

    app.get('/api/resa/stop', function(req, res, next){
        Resa.stopAnalysis();
        return res.send('Stopped Analysis');
    });
};


