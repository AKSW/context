var _ = require('underscore');
// includes
var Corpus = require('../../modules/corpus');

// export index
exports.createCorpus = {
    path: '/api/corpus',
    method: 'post',
    returns: function(req, res, next){
        // get data
        var corpus = req.body;

        // append user to corpus
        corpus = _.extend(corpus, {user: req.user._id});

        // trigger creation
        Corpus.createCorpus(corpus, function(err, id) {
            if(err) {
                return next(err);
            }

            return res.redirect('/corpus/'+id);
        });
    }
};
