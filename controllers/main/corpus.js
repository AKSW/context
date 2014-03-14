// db
var Corpus = require('../../db/corpus').Corpus;

// export index
exports.corpusView = {
    path: '/corpus/:id',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('corpus');
    }
};

exports.corpusViewWithExtention = {
    path: '/corpus/:id/*',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('corpus');
    }
};
