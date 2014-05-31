var logger = require('../../logger');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var utf8 = require('utf8');


// db
var ArticleDB = require('../../models').Article;
var CorpusDB = require('../../models').Corpus;
var UserDB = require('../../models').User;
var baseUri = "http://127.0.0.1:8080/context";
var rdfstore = require("rdfstore");
var config = require('../../config');

var rdf = require("rdf");

function saveArticleAsRDF(req, res, next) {
    var article = req.params.id;

    ArticleDB.findOne({_id: article}).exec(function (err, article) {
        if (err) {
            return next(err);
        }

        article = article.toObject();

        var nifarticle;
        nifarticle = article2nif(article);


        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(nifarticle);
    });

}

function article2nif(articleobject) {
    if (!articleobject) {
        console.log("No articleobject in article2nif");
    }
    var nifarticle;
    nifarticle = createTTL(articleobject);
    save2rdfstore(nifarticle, articleobject._id);
    return nifarticle;

}


function saveCorpusAsRDF(req, res, next) {
    var corpusid = req.params.id;

    CorpusDB.findOne({_id: corpusid}).exec(function (err, corpus) {
        if (err) {
            console.log(err);
        }
        ArticleDB.find({corpuses: corpus._id}).exec(function (err, articles) {
            if (err) {
                console.log(err);
            }
            var nifarray;
            articles.forEach(function (article) {
                nifarray = nifarray + article2nif(article);
            });

            res.setHeader("Content-Type", "text/html; charset=UTF-8");
            res.send(nifarray);

        });

    });
}

var saveUserArticlesAsRDF = async(function (req, res, next) {
    var user = await(UserDB.findOne({_id: req.params.id}).exec());
    if (!user) {
        return console.log('User not found!');
    }
    var userCorpuses = await(CorpusDB.find({user: user._id}).exec());
    if (!userCorpuses || userCorpuses.length === 0) {
        return console.log('no corpuses found!');
    }

    var article;
    var output = "";
    for (var i in userCorpuses) {
        //get all article for corpus i
        article = await(ArticleDB.find({corpuses: userCorpuses[i]._id}).exec());

        //process all articles
        for (var j in article) {
            output = output + await(article2nif(article[j]));
        }

    }
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.send(output);

});

function createTTL(articleObject) {

    if (!articleObject) {
        console.log("There is no Article Object!");
    }
    var prefix = nifprefix();
    var context = nifContext(articleObject);
    var nifentity = [];

    for (var i = 0; i < articleObject.entities.length; i++) {
        nifentity[i] = nifEntities(articleObject.entities[i], articleObject);
    }

    var output = prefix;

    //TODO Refactor this code its shitty
    for (var i in context) {
        output = output + context[i] + "\r\n";
    }

    for (var j in nifentity) {

        for (var k in nifentity[j]) {
            output = output + nifentity[j][k] + "\r\n";

        }

    }
    var turtleParser = new rdf.TurtleParser();
    turtleParser.parse(output);
    var nifstring = turtleParser.graph;
    return output;
}


// Defines prefixes for nif File
function nifprefix() {
    var prefix = "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \r\n" +
        "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \r\n" +
        "@prefix owl: <http://www.w3.org/2002/07/owl#> . \r\n" +
        "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \r\n" +
        "@prefix nif: <http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#> . \r\n" +
        "@prefix itsrdf: <http://www.w3.org/2005/11/its/rdf#> . \r\n" +
        "@prefix  dcterms: <http://purl.org/dc/terms/> .\r\n";
    return prefix;
}

// Defines nifContext
function nifContext(articleObject) {
    var context = new Object();
    var length = utf8.encode((articleObject.plaintext)).length;
    context.uri = '<' + baseUri + '/article/' + articleObject._id + '#char=0,' + length + '> ';

    context.nifExpressions = 'a nif:String , nif:Context , nif:RFC5147String ; ';
    context.nifString = 'nif:isString ' + '"""' + articleObject.plaintext + '"""^^xsd:string; ';
    context.beginindex = 'nif:beginIndex "0"^^xsd:nonNegativeInteger; ';
    context.endIndex = 'nif:endIndex "' + length + '"^^xsd:nonNegativeInteger; ';
    context.identifier = 'dcterms:identifier "' + articleObject._id + '"^^xsd:string ; ';
    context.created = 'dcterms:created "' + articleObject.creation_date.toISOString() + '"^^xsd:dateTime ; ';
    context.taConfidence = 'itsrdf:taConfidence "' + 0.2 + '"^^xsd:decimal ; ';
    context.title = 'nif:title """' + articleObject.title + '"""^^xsd:string ; ';
    context.sourceUrl = 'nif:sourceUrl <' + articleObject.uri + '> ; ';
    context.source = 'dcterms:source """' + articleObject.uri + '"""^^xsd:string ';
    context.end = '. ';

    return context;

}

function nifEntities(entity, articleObject) {

    var nifentity = new Object();
    var beginindex = parseInt(entity.offset, 10) + 1;
    var endindex = beginindex + utf8.encode(entity.name).length;
    nifentity.uri = '<' + baseUri + '/article/' + articleObject._id + '#char=' + beginindex + ',' + endindex + '>';
    nifentity.nifExpressions = 'a nif:String , nif:RFC5147String ;';
    nifentity.word = "a nif:Word;";
    nifentity.referenceContext = 'nif:referenceContext <' + baseUri + '/article/' + articleObject._id + '#char=0' + ',' + utf8.encode(articleObject.plaintext).length + '>; ';
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
    if (type.substring(0, 7) !== "DBpedia:") {
        return "itsrdf:taClassRef <http://dbpedia.org/ontology/" + type.substring(8) + ">;\r\n";
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

            store.load("text/turtle", ttlString, graphuri, function (success, results) {
                if (!success) {
                    logger.info("Error saving the graphuri" + graphuri + " Error: " + results);
                }

            });
        });
        //@TODO Observe how well deletition works. rdfjs didn't always del all graphs then add a lowlevel delete option


    });
}


module.exports = function (app) {
// export save Article as Rdf
    app.get('/api/nifsave/article/:id', saveArticleAsRDF);
    app.get('/api/nifsave/corpus/:id', saveCorpusAsRDF);
    app.get('/api/nifsave/user/:id', saveUserArticlesAsRDF);
}