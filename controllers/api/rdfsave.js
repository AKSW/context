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
var prefixadded = false;
var nifStrings = [];
var rdf = require("rdf");


function saveArticleAsRDF(req, res, next) {
        var article = req.params.id;

    ArticleDB.findOne({_id: article}).exec(function (err, article) {
        if (err) {
            return next(err);
        }
        //debugger;
        article = article.toObject();
        //debugger;
        var nifarticle;
        nifarticle = article2nif(article);

        // send response
        //return myarticle;
        //var narf = rdfstore().mystore;
        //var test = myrdfstore(nifarticle);
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.send(nifarticle);
    });

    }

function article2nif(articleobject){
    if (!articleobject){
        console.log("No articleobject in article2nif");
    }
    var nifarticle;
    nifarticle = createTTL(articleobject);
    myrdfstore(nifarticle, articleobject._id);
    return nifarticle;

}


function saveCorpusAsRDF(req, res, next){
    var corpusid = req.params.id;

    CorpusDB.findOne({_id: corpusid}).exec(function(err, corpus) {
        if (err) {
            console.log(err);
        }
        ArticleDB.find({corpuses: corpus._id}).exec(function(err, articles) {
            if(err) {
                console.log(err);
            }
            var nifarray;
            articles.forEach(function (article){
                nifarray = nifarray + article2nif(article);
            });

            res.setHeader("Content-Type", "text/html; charset=UTF-8");
            res.send(nifarray);

        });

    });
}

var saveUserArticlesAsRDF = async(function (req, res, next) {
    var user = await(UserDB.findOne({_id: req.params.id}).exec());
    if (!user){
        return console.log('User not found!');
    }
    var userCorpuses =  await(CorpusDB.find({user: user._id}).exec());
    if(!userCorpuses || userCorpuses.length === 0) {
        return console.log('no corpuses found!');
    }

    var article;
    var output ="";
    for(var i in userCorpuses){
        //get all article for corpus i
        article = await(ArticleDB.find({corpuses: userCorpuses[i]._id}).exec());

        //process all articles
        for(var j in article){
            output = output + await (article2nif(article[j]));
        }

    }
    //console.log(nifStrings);
    //var test = myrdfstore(output);
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.send(output);

});

function createTTL(articleObject){

    if (!articleObject){
        console.log("There is no Article Object!");
    }
    var prefix = nifprefix();
    var context = nifContext(articleObject);
    var nifentity = [];

    for(var i=0; i < articleObject.entities.length; i++) {
        nifentity[i] = nifEntities(articleObject.entities[i], articleObject);
    }

    var output =prefix;
    /*if (prefixadded===false){
        output = output + prefix;
        prefixadded = true;
    }*/
    //TODO Refactor this code its shitty
    for(var i in context){
        output = output + context[i] + "\r\n";
    }

    for(var j in nifentity){

        for (var k in nifentity[j]){
            output = output + nifentity[j][k] + "\r\n";

        }

    }
    var turtleParser = new rdf.TurtleParser();
    turtleParser.parse(output);
    var nifstring = turtleParser.graph;
    //var nifobject = new Object();
    //nifobject.articleID = articleObject._id;
    //nifobject.nifstring = nifstring;
    //nifStrings.push(nifobject);

    //debugger;
    return output;
    //});
}


// Defines prefixes for nif File
function nifprefix(){
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
function nifContext(articleObject){
    var context = new Object();
    var length = utf8.encode((articleObject.plaintext)).length;
    context.uri = '<' + baseUri+ '/article/'+ articleObject._id + '#char=0,'+ length +'> ';

    context.nifExpressions = 'a nif:String , nif:Context , nif:RFC5147String ; ';
    context.nifString = 'nif:isString ' +'"""' +articleObject.plaintext + '"""^^xsd:string; ';
    context.beginindex = 'nif:beginIndex "0"^^xsd:nonNegativeInteger; ';
    context.endIndex = 'nif:endIndex "'+ length +'"^^xsd:nonNegativeInteger; ';
    context.identifier = 'dcterms:identifier "' + articleObject._id + '"^^xsd:string ; ';
    context.created = 'dcterms:created "' + articleObject.creation_date.toISOString() + '"^^xsd:dateTime ; ';
    context.taConfidence = 'itsrdf:taConfidence "'+0.2+'"^^xsd:decimal ; ';
    context.title = 'nif:title """' + articleObject.title + '"""^^xsd:string ; ';
    context.sourceUrl = 'nif:sourceUrl <' + articleObject.uri + '> ; ';
    context.source = 'dcterms:source """' + articleObject.uri + '"""^^xsd:string ';
    context.end = '. ';

    return context;

}

function nifEntities(entity, articleObject){

    var nifentity = new Object();
    var beginindex = parseInt(entity.offset, 10 )+1;
    var endindex = beginindex + utf8.encode(entity.name).length;
    nifentity.uri = '<' +baseUri+ '/article/'+ articleObject._id + '#char=' + beginindex  +','+ endindex +'>';
    nifentity.nifExpressions = 'a nif:String , nif:RFC5147String ;';
    nifentity.word = "a nif:Word;";
    nifentity.referenceContext = 'nif:referenceContext <' +baseUri+ '/article/'+ articleObject._id + '#char=0' + ','+ utf8.encode(articleObject.plaintext).length +'>; ';
    nifentity.anchorOf = 'nif:anchorOf """'+ entity.name +'"""^^xsd:string ;';
    nifentity.beginindex = 'nif:beginIndex "' + beginindex + '"^^xsd:nonNegativeInteger; ';
    nifentity.endIndex = 'nif:endIndex "'+ endindex +'"^^xsd:nonNegativeInteger; ';
    //nifentity.wasConvertedFrom = 'nif:wasConvertedFrom <"'+ 'http://FIXME.com/' +'> '; //TODO add proper was convertedfrom tag
    nifentity.taConfidence = 'itsrdf:taConfidence "' + entity.precision + '"^^xsd:decimal ; ';
    nifentity.identifier = 'dcterms:identifier "' + entity._id + '"^^xsd:string ; ';

    nifentity.taClassRef ="";
    entity.types.forEach( function (type){
        nifentity.taClassRef = nifentity.taClassRef + getTaClassRef(type);
    });

    nifentity.taIdentRef = "itsrdf:taIdentRef <"+ entity.uri +">;";
    nifentity.end = '. ';
    return nifentity;
}

function getTaClassRef(type){

    if (type.substring(0, 7) !== "DBpedia:") {
        return "itsrdf:taClassRef <http://dbpedia.org/ontology/"+ type.substring(8) +">;\r\n";
    }

}
/*function nodeNotifier(nodeuri){
    new rdfstore.Store({persistent: true,
        engine: 'mongodb',
        name: 'rdfbackend', // quads in MongoDB will be stored in a DB named myappstore
        overwrite: false,    // delete all the data already present in the MongoDB server
        mongoDomain: 'localhost', // location of the MongoDB instance, localhost by default
        mongoPort: 27017, // port where the MongoDB server is running, 27017 by default
        setBatchLoadEvents: true
    }, function (store) {

        //debugger;
        //console.log(nodeuri);
        store.node(nodeuri, function (success, node){
            //debugger;
            if ((success=== true)&& (node.length >0 )){
                debugger;
                var graph = new RDFJSInterface.Graph();
                node.triples.forEach(function (mytrip) {
                    rdf.createTriple

                    /*store.execute("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            DELETE WHERE { GRAPH <https://github.com/antoniogarrote/rdfstore-js#default_graph> {  <"+ mytrip.subject.nominalValue +"> ?p ?o . } \
        }", function(success, results) {
                        debugger;
                        //console.log(results);
                        //console.log(success);
                });
            });
            //console.log(success);
            //console.log(node);
                store.delete(mytrip);


    }});


});
}*/
function myrdfstore(ttlString, articleID){
    new rdfstore.Store({persistent: true,
        engine: 'mongodb',
        name: 'rdfbackend', // quads in MongoDB will be stored in a DB named myappstore
        overwrite: false,    // delete all the data already present in the MongoDB server
        mongoDomain: 'localhost', // location of the MongoDB instance, localhost by default
        mongoPort: 27017, // port where the MongoDB server is running, 27017 by default
        setBatchLoadEvents: true
    }, function (store) {
        logger.info("Rdf Store in rdfsave intialized complete");
        //var graphUri = "";
       console.log(articleID);
        var graphuri = baseUri+"/article/"+articleID;
        //var graph =nifprefix();
        store.graph(graphuri, function (success,data){
            debugger;
            if (data.length !=0) {
                store.clear(graphuri, function (success){
                    logger.info("There was entrys for Graph: "+graphuri+" which has been erased?"+success);
                });

            }

        });

        store.load("text/turtle", ttlString, graphuri, function(success, results) {
            //store.setPrefix("context:", "http://127.0.0.1/context/");
            console.log(success);
            console.log(results);
            if (!success) { logger.info("Something gone wrong in rdfsave" + results);
            }
            return;
        });


    });
}
/*
function speicher(ttlString, articleId){
    new rdfstore.Store({persistent: true,
        engine: 'mongodb',
        name: 'rdfbackend', // quads in MongoDB will be stored in a DB named myappstore
        overwrite: false,    // delete all the data already present in the MongoDB server
        mongoDomain: 'localhost', // location of the MongoDB instance, localhost by default
        mongoPort: 27017, // port where the MongoDB server is running, 27017 by default
        setBatchLoadEvents: true
    }, function savedb (store) {
        logger.info("nifstore intialized complete");

        store.load("text/turtle", baseUri+ '/article/'+ articleId ,ttlString, function(success, results) {
            //store.setPrefix("context:", "http://127.0.0.1/context/");
            if (!success) { logger.info("Something went wrong in rdfsave" + results); }
            //debugger;
            prefixadded = false;
        });
        /*nodeuris.forEach(function(nodeuri){
         store.startObservingNode(nodeuri, nodeNotifier(nodeuri));
         });*/



    //});
//}

module.exports =  function(app) {
// export save Article as Rdf
    app.get('/api/nifsave/article/:id', saveArticleAsRDF);
    app.get('/api/nifsave/corpus/:id', saveCorpusAsRDF);
    app.get('/api/nifsave/user/:id', saveUserArticlesAsRDF);
}