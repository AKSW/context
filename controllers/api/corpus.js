var _ = require('underscore');
var crypto = require('crypto');
// includes
var Corpus = require('../../modules/corpus');
var CorpusDB = require('../../db/corpus').Corpus;
var Article = require('../../db/article').Article;

// export create corpus
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

// export get corpus
exports.getCorpus = {
    path: '/api/corpus/:id',
    method: 'get',
    returns: function(req, res, next){
        // get data
        var corpus = req.params.id;

        // find corpus
        CorpusDB.findOne({_id: corpus}, function(err, corpus) {
            if(err) {
                return next(err);
            }

            // find articles
            Article.find({corpuses: corpus._id}, function(err, articles) {
                if(err) {
                    return next(err);
                }
                var articlesCount = articles.length;
                var entitiesCount = 0;

                // count entities
                articles.forEach(function(article) {
                    entitiesCount += article.entities.length;
                });

                // append counts to corpus
                corpus = corpus.toObject();
                corpus.articlesCount = articlesCount;
                corpus.entitiesCount = entitiesCount;

                // send response
                return res.send(corpus);
            });
        });
    }
};

// export get corpus
exports.getCorpusJson = {
    path: '/api/corpus/:id/facets',
    method: 'get',
    returns: function(req, res, next){
        // get data
        var corpus = req.params.id;

        // find corpus
        CorpusDB.findOne({_id: corpus}).exec(function(err, corpus) {
            if(err) {
                return next(err);
            }

            // find articles
            Article.find({corpuses: corpus._id}, function(err, articles) {
                if(err) {
                    return next(err);
                }

                // append counts to corpus
                corpus = corpus.toObject();
                corpus.articles = articles;

                // send response
                return res.send(corpus);
            });
        });
    }
};


