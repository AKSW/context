// db
var Corpus = require('../../db/corpus').Corpus;

// export index
exports.index = {
    path: '/corpus/:id',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('corpus');
    }
};
