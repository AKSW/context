// db
var logger = require('../../logger');
var ArticleDB = require('../../models').Article;
var CorpusDB = require('../../models').Corpus;
var UserDB = require('../../models').User;
var rdfstore = require("rdfstore");
var config = require('../../config');
var baseUri = config.rdfbackend.baseuri;
var nifcreator = require ("../../modules/nif.js");
var nifprefix = nifcreator.nifprefix;
var mongodb = require("mongodb");
var async = require('async');

function saveAllArticleAsRDF(req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }

    ArticleDB.find().exec(function (err, articles) {
        if (err) {
            return next(err);
        }
        //Check if there are any article
        if (articles.length === 0){
            res.send("No Article found");
            return next;
        }

        var nifString = nifprefix;
        articles.forEach(function (article) {
            nifString = nifString + articleProcessor(article);
        });

        sendTTL(req, res, nifString);
    });

}
function saveArticleAsRDF(req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }

    ArticleDB.findOne({_id: req.params.id}).exec(function (err, article) {
        if (err) {
            return next(err);
        }

        //Check if there are any article
        if ((article === null) || (article == "undefined")){
            res.send("No Article found");
            return next;
        }

        article = article.toObject();

        var nifString = nifprefix;
        nifString = nifString + articleProcessor(article);
        sendTTL(req, res, nifString);
    });

}

function saveCorpusAsRDF(req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    CorpusDB.findOne({_id: requestId}).exec(function (err, corpus) {

        if (err) {
            return next(new Error('Something gone wrong by finding Courpus!' + err));
        }
        else if ( ( corpus=== null) || (corpus.length === 0)){
            res.send("Corpus not found");
            return next();
        }
        ArticleDB.find({corpuses: corpus._id}).exec(function (err, articles) {
            if (err) {
                return next(new Error('Something gone wrong by finding articles'+err));
            }
            else if ( ( articles=== null) || (articles.length === 0)){
                res.send("Article  not found");
                return next();
            }
            var nifString = nifprefix;
            articles.forEach(function (article) {
                nifString = nifString + articleProcessor(article);
            });

            sendTTL(req, res, nifString);

        });

    });
}

function saveUserArticlesAsRDF(req, res, next) {
    var requestId = req.params.id;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    UserDB.findOne({_id: requestId}).exec(function (err, user) {
        if (err) {
            return next(new Error('Something gone wrong by finding User'+err));
        }
        if ((user === "undefined")|| ( user === null) || (user.length === 0)) {
            res.send(" User not found");
            return next();
        }
        CorpusDB.find({user: user._id}).exec(function (err, userCorpuses) {
            if (!userCorpuses || userCorpuses.length === 0 || userCorpuses === null) {
                res.send(" There are no Corpus for this user");
                return next();
            }
            var article;
            var nifString = nifprefix;
            for (var i in userCorpuses) {
                //get all article for corpus i
                article = ArticleDB.find({corpuses: userCorpuses[i]._id}).exec(function (err, article) {
                    //process all articles
                    for (var j in article) {
                        nifString = nifString + articleProcessor(article[j]);
                    }
                    sendTTL(req, res, nifString);
                });
            }
        });

    });
}

function articleProcessor(articleobject) {
    if ((articleobject == null)||(articleobject == "undefined")) {
        return false;
    }
    var nifarticle;
    nifarticle = nifcreator.articleTonif(articleobject);

    if ((nifarticle) && (nifarticle != "undefined")){
        save2rdfstore(nifarticle, articleobject._id);
        return nifarticle;
    }
    else {
        return false;
    }
}


function save2rdfstore(ttlString, articleID) {
    rdfstore.create(config.rdfbackendSettings, function (store) {
        var graphuri = baseUri + "/article/" + articleID;

        //delete article Graph if exist
        store.clear(graphuri, function (success) {
            if (!success) {
                logger.info("Error cleaning the graph URI for graph: " + graphuri);
            }

            store.load("text/turtle", nifprefix + ttlString, graphuri, function (success, results) {
                if (!success) {
                    logger.info("Error saving the graphuri" + graphuri + " Error: " + results);
                }

            });
        });
        //@TODO Observe how well deletition works. rdfjs didn't always del all graphs then add a lowlevel delete option


    });
}

function delAllArticleAsRDF(req, res, next) {
    //TODO add some form of verification
    var overwriteconf = config.rdfbackendSettings;
    overwriteconf.overwrite = true;
    rdfstore.create(overwriteconf, function (store){
        res.send("Delete succesfully");
    });

    /*rdfstore.create(config.rdfbackendSettings, function (store) {
        store.registeredGraphs(function(sucess, graphnames) {
                if (!sucess) {
                    res.send("Error! "+err);
                    return next(new Error('Error! Something ist gone wrong getting the registered graphs!' + err))
                };
                var graphNamesArray=[];
                var defaultgraph = ["https://github.com/antoniogarrote/rdfstore-js#default_graph"];
                debugger;

                //put the URI of all named graphs to an array
                for (var i in graphnames) {

                    store.clear(i, function (success) {
                        if(!success){
                            logger.info("Clearing RDF sotre failed");
                        };
                    });
                }
                res.send("Cleaning Process Complete");

            });*/

    //});
}
function delCorpusAsRDF(req, res, next){
    //TODO Implement this
    var requestId = req.params.id;
    CorpusDB.findOne({_id: requestId}).exec(function (err, corpus) {

        if (err) {
            return next(new Error('Something gone wrong by finding Courpus!' + err));
        }
        else if ( ( corpus=== null) || (corpus.length === 0)){
            res.send("Corpus not found");
            return next();
        }
        ArticleDB.find({corpuses: corpus._id}).exec(function (err, articles) {
            if (err) {
                return next(new Error('Something gone wrong by finding articles'+err));
            }
            else if ( ( articles=== null) || (articles.length === 0)){
                res.send("Article  not found");
                return next();
            }

            delArticles(articles);
        });

    });

}

function delUserArticlesAsRDF(req, res, next){
    var requestId = req.params.id;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    UserDB.findOne({_id: requestId}).exec(function (err, user) {
        if (err) {
            return next(new Error('Something gone wrong by finding User'+err));
        }
        if ((user === "undefined")|| ( user === null) || (user.length === 0)) {
            res.send(" User not found");
            return next();
        }
        CorpusDB.find({user: user._id}).exec(function (err, userCorpuses) {
            if (!userCorpuses || userCorpuses.length === 0 || userCorpuses === null) {
                res.send(" There are no Corpus for this user");
                return next();
            }

            for (var i in userCorpuses) {
                //get all article for corpus i
                article = ArticleDB.find({corpuses: userCorpuses[i]._id}).exec(function (err, article) {
                    //del all articles
                    delArticles(article);
                });
            }

        });

    });
    res.send("Deleteprocess startet");

}

function delArticle(req, res, next) {
    var requestId = req.params.id;
    var graphuri = baseUri + "/article/" + requestId;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }

    //TODO add some form of verification
    //TODO better create a new instance of rdfstore with overwrite option

    rdfstore.create(config.rdfbackendSettings, function (store) {
        store.clear(graphuri, function (success) {
            if(!success){
                logger.info("Deleting article"+ requestId +" from RDF backend failed");
                res.send("Deleting article from RDF backend failed");
            }
            else{
                res.send("Successfully deleted graph "+ graphuri);
            }
        });


    });
}

function delArticles(articleArray) {

    var graphuri = baseUri + "/article/";
    var articleIndex = 0;

    rdfstore.create(config.rdfbackendSettings, function (store) {
        async.whilst(function () {
                return articleIndex < articleArray.length;
            },
            function (next) {
                store.clear(graphuri + articleArray[articleIndex]._id, function (success) {
                    if (success) {
                        articleIndex++;
                        next();
                    }
                });
            },
            function (err) {
                // All things are done!
                if (err) logger.info("Error! + " + err);
            });
    });
    }


function isValidMongodbID(id){
    return mongodb.ObjectID.isValid(id);
}

function sendTTL(req, res, data){
    res.setHeader("Content-Type", "text/turtle; charset=UTF-8");
    res.setHeader("Content-Transfer-Encoding: binary"); // to preserve linebreaks (\n instead of \r\n)
    if ((req.params.id == null) || (req.params.id ==="undefined")) req.params.id = "context";
    res.attachment(req.params.id+'.ttl'); //Sets the Content-Disposition header field to requestId.ttl
    res.send(data);
}
module.exports = function (app) {

    if (config.rdfbackend.nifexport) { //check if NIF Export is enabled

        app.get('/api/nif/saveall', saveAllArticleAsRDF);
        app.get('/api/nif/deleteall', delAllArticleAsRDF);

        app.get('/api/nif/article/:id', saveArticleAsRDF);
        app.get('/api/nif/article/del/:id', delArticle);

        app.get('/api/nif/corpus/:id', saveCorpusAsRDF);
        app.get('/api/nif/corpus/del/:id', delCorpusAsRDF);

        app.get('/api/nif/user/:id', saveUserArticlesAsRDF);
        app.get('/api/nif/user/del/:id', delUserArticlesAsRDF);


    }
}