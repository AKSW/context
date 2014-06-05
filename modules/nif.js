
var unorm = require('unorm');
var config = require('../config');
var baseUri = config.rdfbackend.baseuri;
var S = require('string');
var input;
/*
 *
 * @param articleObject = an Article Object from the database with articleSchema
 *
 * return (String) an nif file
 * */
function article2nif(articleObject) {
    debugger;
    if ((!articleObject)||(articleObject=="undefined")) {
        return false;
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
    /*var turtleParser = new rdf.TurtleParser();
     turtleParser.parse(nifprefix() + output);
     var nifstring = turtleParser.graph;*/
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

    if (type.substring(0, 8) === "DBpedia:") {
        return "itsrdf:taClassRef <http://dbpedia.org/ontology/" + type.substring(8) + ">;\n ";
    }
    else {
        return "itsrdf:taClassRef <" + type + ">;\n ";
    }

}

exports.nifprefix = nifprefix();
exports.articleTonif = function (articleobject){
    return article2nif(articleobject)
}
