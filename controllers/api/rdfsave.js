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


function saveAllArticleAsRDF(req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    console.log(mongoose.Schema.ObjectId.isValid(requestId));
    ArticleDB.find().exec(function (err, articles) {
        if (err) {
            return next(err);
        }
        //TODO add some options if no Article found
        var nifString = nifprefix;
        articles.forEach(function (article) {
            nifString = nifString + articleProcessor(article);
        });

        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(nifString);
    });

}
function saveArticleAsRDF(req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    ArticleDB.findOne({_id: req.params.id}).exec(function (err, article) {
        if (err) {
            return next(err);
        }

        article = article.toObject();

        var nifString = nifprefix;
        nifString = nifString + articleProcessor(article);
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(nifString);
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

            res.setHeader("Content-Type", "text/html; charset=UTF-8");
            res.send(nifString);

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
        if (!user) {
            res.send(" User not found");
            return next(new Error('User not found!'));
        }
        else if (( user === null) || (user.length === 0)) {
            res.send(" User not found");
            return next();
        }
        CorpusDB.find({user: user._id}).exec(function (err, userCorpuses) {
            if (!userCorpuses || userCorpuses.length === 0 || userCorpuses === null) {
                res.send(" There are no Corpus for this user");
                return next();
            }
            var article;
            var output = nifprefix;
            for (var i in userCorpuses) {
                //get all article for corpus i
                article = ArticleDB.find({corpuses: userCorpuses[i]._id}).exec(function (err, article) {
                    //process all articles
                    for (var j in article) {
                        output = output + articleProcessor(article[j]);
                    }
                    res.setHeader("Content-Type", "text/turtle; charset=UTF-8");
                    res.setHeader("Content-Disposition: Attachment;filename=" + req.params.id + ".ttl");
                    res.setHeader("Content-Transfer-Encoding: binary"); // to preserve linebreaks

                    res.send(output);
                    //fs.writeFileSync("E:\\nodejs\\context\\nifdaten\\"+req.params.id+".ttl",output,'utf-8');
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
    //nifarticle = nifcreator.article2nif(articleobject);
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

    rdfstore.create(config.rdfbackendSettings, function (store) {
        rdfstore.rdf.
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

                    store.clear(function (success) {
                        console.log(success);
                    });
                }

            });

    });
}

function isValidMongodbID(id){
    return mongodb.ObjectID.isValid(id);
}

module.exports = function (app) {

    if (config.rdfbackend.nifexport) { //check if NIF Export is enabled
        app.get('/api/nif/article/all', saveAllArticleAsRDF);
        app.get('/api/nif/article/deleteall', delAllArticleAsRDF);
        app.get('/api/nif/article/:id', saveArticleAsRDF);
        app.get('/api/nif/corpus/:id', saveCorpusAsRDF);
        app.get('/api/nif/user/:id', saveUserArticlesAsRDF);
    }
}