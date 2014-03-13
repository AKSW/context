// db
var Corpus = require('../../db/corpus').Corpus;

// export index
exports.index = {
    path: '/corpus/:id',
    method: 'get',
    returns: function(req, res, next) {
        var id = req.params.id;
        Corpus.findOne({_id: id}, function(err, corpus) {
            if(err) {
                console.log('error getting corpus', err);
                return next(err);
            }

            // form data
            var data = {
                error: req.flash('error'),
                corpus: corpus,
            };
            return res.render('corpus', data);
        });
    }
};
