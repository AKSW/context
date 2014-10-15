// includes
// multiparty
var multiparty = require('multiparty');
// logger
// var logger = require('../../logger');
// db
var Corpus = require('../../modules/corpus');
var CorpusDB = require('../../models').Corpus;
var Article = require('../../models').Article;

// functions
var getCorpusArticles = function(req, res, next) {
    // get data
    var corpus = req.params.id;

    // find corpus
    CorpusDB.findOne({
        _id: corpus
    }).exec(function(err, corpus) {
        if (err) {
            return next(err);
        }

        // find articles
        Article.find({
            corpuses: corpus._id
        }, function(err, articles) {
            if (err) {
                return next(err);
            }

            // append counts to corpus
            corpus = corpus.toObject();
            corpus.articles = articles;

            // send response
            return res.send(corpus);
        });
    });
};
var sortTags=function(tags){
    var tmp=[],new_tags={};
    for (var key in tags){
        tmp.push([key,tags[key].count]);
    }

    tmp.sort(function(a,b){
        return b[1]-a[1];
    });
    //logger.info(tmp);
    tmp.forEach(function(e){
        new_tags[e[0]]=tags[e[0]];
    })
    return new_tags;
}
var getCorpusTags = function(req, res, next) {
    // get data
    var corpus = req.params.id;
    var entitiesCount=0,tags={};
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
            // count entities
            articles.forEach(function(article) {
                article.entities.forEach(function(entity) {
                    if(tags[entity.uri]==undefined){
                        //total number of entities
                        entitiesCount += article.entities.length;
                        tags[entity.uri]={name:entity.name,types:entity.types, count:1};
                        //logger.info(tags);
                    }else{
                        tags[entity.uri].count++;
                    }
                });

            });
            corpus.entitiesCount=entitiesCount;
            corpus.tags=sortTags(tags);
            // send response
            return res.send(corpus);
        });
    });
};

// export routes
module.exports = function(app) {
    // export create corpus
    app.post('/api/corpus', function(req, res, next) {
        // get form
        var form = new multiparty.Form();

        // parse the form
        form.parse(req, function(err, fields, files) {
            if (err) {
                return next(err);
            }

            // init corpus with user
            var corpus = {
                user: req.user._id
            };
            // push field values into it
            for (var field in fields) {
                corpus[field] = fields[field][0];
            }

            // if files was sent
            // push files info into corpus
            if (files.input) {
                corpus.files = [];
                corpus.input_count = files.input.length;
                for (var index in files.input) {
                    var file = files.input[index];
                    corpus.files.push({
                        name: file.originalFilename,
                        path: file.path,
                    });
                }
            }

            // trigger creation
            Corpus.createCorpus(corpus, function(err, id) {
                if (err) {
                    return next(err);
                }

                return res.redirect('/corpus/' + id);
            });
        });
    });

    // export get corpus
    app.get('/api/corpus/:id', function(req, res, next) {
        // get data
        var corpus = req.params.id;

        // find corpus
        CorpusDB.findOne({
            _id: corpus
        }, function(err, corpus) {
            if (err) {
                return next(err);
            }

            // find articles
            Article.find({
                corpuses: corpus._id
            }, function(err, articles) {
                if (err) {
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
    });

    // export re-annotate corpus
    app.get('/api/corpus/:id/reannotate', function(req, res, next) {
        // get data
        var corpus = req.params.id;

        // find corpus
        CorpusDB
        .findOne({_id: corpus})
        .exec(function(err, corpus) {
            if(err) {
                return next(err);
            }
            // trigger re-annotate
            Corpus.annotateCorpus(corpus);
            // respond ok
            return res.send(200);
        });
    });

    // export get corpus
    app.get('/api/corpus/:id/facets', getCorpusArticles);

    // relations
    app.get('/api/corpus/:id/relations', getCorpusArticles);

    // co-occurence
    app.get('/api/corpus/:id/cooc', getCorpusArticles);

    // tag cloud
    app.get('/api/corpus/:id/tags', getCorpusTags);
};
