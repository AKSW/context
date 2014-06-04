var logger = require('../../logger');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var utf8 = require('utf8');
var unorm = require('unorm');


// db
var ArticleDB = require('../../models').Article;
var CorpusDB = require('../../models').Corpus;
var UserDB = require('../../models').User;
var rdfstore = require("rdfstore");
var config = require('../../config');
var baseUri = config.rdfbackend.baseuri;
var S = require('string');
var rdf = require("rdf");
var fs = require ("fs");


function saveAllArticleAsRDF(req, res, next) {
    var article = req.params.id;

    ArticleDB.find().exec(function (err, articles) {
        if (err) {
            return next(err);
        }
        //TODO add some options if no Article found
        var nifString =nifprefix();
        debugger;
        articles.forEach(function (article) {
            nifString = nifString + articleProcessor(article);
        });

        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(nifString);
    });

}
function saveArticleAsRDF(req, res, next) {
    var articleid = req.params.id;

    ArticleDB.findOne({_id: req.params.id}).exec(function (err, article) {
        if (err) {
            return next(err);
        }
        debugger;
        article = article.toObject();

        var nifString = nifprefix();
        nifString = nifString + articleProcessor(article);


        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(nifString);
    });

}

function saveCorpusAsRDF(req, res, next) {
    var corpusid = req.params.id;

    CorpusDB.findOne({_id: corpusid}).exec(function (err, corpus) {
        debugger;
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
            var nifString = nifprefix();
            articles.forEach(function (article) {
                nifString = nifString + articleProcessor(article);
            });

            res.setHeader("Content-Type", "text/html; charset=UTF-8");
            res.send(nifString);

        });

    });
}

function saveUserArticlesAsRDF(req, res, next) {
    UserDB.findOne({_id: req.params.id}).exec(function (err, user) {
        if (!user) {
            res.send(" User not found");
            return next(new Error('User not found!'));
        }
        else if ( ( user=== null) || (user.length === 0)){
         res.send(" User not found");
         return next();
         }
        CorpusDB.find({user: user._id}).exec(function (err, userCorpuses) {
            if (!userCorpuses || userCorpuses.length === 0 || userCorpuses === null) {
                res.send(" There are no Corpus for this user");
                return next();
            }
            var article;
            var output = nifprefix();
            for (var i in userCorpuses) {
                //get all article for corpus i
                article = ArticleDB.find({corpuses: userCorpuses[i]._id}).exec( function (err, article){
                    //process all articles
                    for (var j in article) {
                        output = output + articleProcessor(article[j]);
                    }
                    res.setHeader("Content-Type", "text/turtle; charset=UTF-8");
                    res.setHeader("Content-Disposition: Attachment;filename="+req.params.id+".ttl");
                    res.setHeader("Content-Transfer-Encoding: binary"); // to preserve linebreaks

                    res.send(output);
                    //fs.writeFileSync("E:\\nodejs\\context\\nifdaten\\"+req.params.id+".ttl",output,'utf-8');
                });



            }



        });

    });
    /*async(function () {

        var user = await(UserDB.findOne({_id: req.params.id}).exec());
        console.log(user);
        if (!user) {
            res.send(" User not found");
            return next(new Error('User not found!'));
        }
        /*else if ( ( user=== null) || (user.length === 0)){
            res.send(" User not found");
            return next();
        }
        var userCorpuses = await(CorpusDB.find({user: user._id}).exec());
        if (!userCorpuses || userCorpuses.length === 0 || userCorpuses === null) {
            res.send(" Corpus not found");
            return next();
        }

        var article;
        var output = nifprefix();
        for (var i in userCorpuses) {
            //get all article for corpus i
            article = await(ArticleDB.find({corpuses: userCorpuses[i]._id}).exec());

            //process all articles
            for (var j in article) {
                output = output + await(articleProcessor(article[j]));
            }

        }
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(output);

    });*/
}

function articleProcessor(articleobject) {
    if (!articleobject) {
        return;
    }
    var nifarticle;
    nifarticle = article2nif(articleobject);
    save2rdfstore(nifarticle, articleobject._id);
    return nifarticle;

}

function article2nif(articleObject) {

    if (!articleObject) {
        return next(new Error('There is no article Object!'));
    }

    var context = nifContext(articleObject);
    var nifentity = [];

    for (var i = 0; i < articleObject.entities.length; i++) {
        nifentity[i] = nifEntities(articleObject.entities[i], articleObject);
    }

    var output = "";

    //TODO Refactor this code its shitty
    for (var i in context) {
        output = output + context[i] + "\n";
    }

    for (var j in nifentity) {

        for (var k in nifentity[j]) {
            output = output + nifentity[j][k] + "\n";

        }

    }
    //TODO maybe check if its a correct turtle Synthax
    var turtleParser = new rdf.TurtleParser();
    turtleParser.parse(nifprefix() + output);
    var nifstring = turtleParser.graph;
    return output;
}


// Defines prefixes for nif File
function nifprefix() {
    var prefix = "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
        "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
        "@prefix owl: <http://www.w3.org/2002/07/owl#> . \n" +
        "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \n" +
        "@prefix nif: <http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#> . \n" +
        "@prefix itsrdf: <http://www.w3.org/2005/11/its/rdf#> . \n" +
        "@prefix  dcterms: <http://purl.org/dc/terms/> .\n";
    return prefix;
}

// Defines nifContext
function nifContext(articleObject) {
    var context = new Object();
    var unormform = unorm.nfc(articleObject.plaintext);
    var length = unormform.length;
    context.uri = '<' + baseUri + '/article/' + articleObject._id + '#char=0,' + length + '> ';
    context.nifExpressions = 'a nif:String , nif:Context , nif:RFC5147String ; ';
    context.nifString = 'nif:isString ' + '"""' + unormform + '"""^^xsd:string; ';
    context.beginindex = 'nif:beginIndex "0"^^xsd:nonNegativeInteger; ';
    context.endIndex = 'nif:endIndex "' + length + '"^^xsd:nonNegativeInteger; ';
    context.identifier = 'dcterms:identifier "' + articleObject._id + '"^^xsd:string ; ';
    context.created = 'dcterms:created "' + articleObject.creation_date.toISOString() + '"^^xsd:dateTime ; ';
    context.taConfidence = 'itsrdf:taConfidence "' + 0.2 + '"^^xsd:decimal ; ';
    context.title = 'nif:title """' + articleObject.title + '"""^^xsd:string ; ';
    context.sourceUrl = 'nif:sourceUrl <' + articleObject.uri + '> ; ';
    context.source = 'dcterms:source """' + S(articleObject.source).escapeHTML().s + '"""^^xsd:string ';
    context.end = '. ';

    return context;

}

function nifEntities(entity, articleObject) {

    var nifentity = new Object();
    unormform = unorm.nfc(entity.name);  //converting to UFT8 NFC to be comptabile with NIF
    utfFormNfcPlaintext = unorm.nfc(articleObject.plaintext);  //converting to UFT8 NFC to be comptabile with NIF
    var beginindex = utfFormNfcPlaintext.indexOf(entity.name,parseInt(entity.offset, 10)-5) + 1 ;   //The Offset is not equal to NIF calculation rules so we are recalculating the index
    var endindex = beginindex + unormform.length;

    nifentity.uri = '<' + baseUri + '/article/' + articleObject._id + '#char=' + beginindex + ',' + endindex + '>';
    nifentity.nifExpressions = 'a nif:String , nif:RFC5147String ;';
    nifentity.word = "a nif:Word;";
    nifentity.referenceContext = 'nif:referenceContext <' + baseUri + '/article/' + articleObject._id + '#char=0' + ',' + utfFormNfcPlaintext.length + '>; ';
    nifentity.anchorOf = 'nif:anchorOf """' + entity.name + '"""^^xsd:string ;';
    nifentity.beginindex = 'nif:beginIndex "' + beginindex + '"^^xsd:nonNegativeInteger; ';
    nifentity.endIndex = 'nif:endIndex "' + endindex + '"^^xsd:nonNegativeInteger; ';
    //nifentity.wasConvertedFrom = 'nif:wasConvertedFrom <"'+ 'http://FIXME.com/' +'> '; //TODO add proper was convertedfrom tag
    nifentity.taConfidence = 'itsrdf:taConfidence "' + entity.precision + '"^^xsd:decimal ; ';
    nifentity.identifier = 'dcterms:identifier "' + entity._id + '"^^xsd:string ; ';

    nifentity.taClassRef = "";
    entity.types.forEach(function (type) {
        nifentity.taClassRef = nifentity.taClassRef + getTaClassRef(type);
    });

    nifentity.taIdentRef = "itsrdf:taIdentRef <" + entity.uri + ">;";
    nifentity.end = '. ';
    return nifentity;
}

function getTaClassRef(type) {
//TODO Add the other Services

    if (type.substring(0, 8) === "DBpedia:") {
        return "itsrdf:taClassRef <http://dbpedia.org/ontology/" + type.substring(8) + ">;\n";
    }
    else {
        return "itsrdf:taClassRef <" + type + ">;\n";
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

            store.load("text/turtle", nifprefix() + ttlString, graphuri, function (success, results) {
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

module.exports = function (app) {
    if (config.rdfbackend.nifexport) {
// export save Article as Rdf
        app.get('/api/nif/article/all', saveAllArticleAsRDF);
        app.get('/api/nif/article/deleteall', delAllArticleAsRDF);
        app.get('/api/nif/article/:id', saveArticleAsRDF);
        app.get('/api/nif/corpus/:id', saveCorpusAsRDF);
        app.get('/api/nif/user/:id', saveUserArticlesAsRDF);
    }
}