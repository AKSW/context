
var unorm = require('unorm');
var config = require('../config');
var baseUri = config.rdfbackend.baseuri;
var S = require('string');
var input;
var k=0;
/*
 *
 * @param articleObject = an Article Object from the database with articleSchema
 *
 * return (String) an nif file
 * */
function article2nif(articleObject) {

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
    //TODO maybe check if it has a correct turtle Synthax
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
    var title, source;
    if ((articleObject.source=="undefined") || (articleObject.source==null)) { var source = ""; }
    else{source = sanitizeString(articleObject.source); }

    if (articleObject.title=="undefined" || (articleObject.title==null)) {title = "";}
    else {title = sanitizeString(articleObject.title); }
    //var plaintext = S(articleObject.title).stripTags().s+ '. ' + S(articleObject.source).stripTags().s; //Titles are added to source Code before sending to NLP Service
    var plaintext = title+ '. ' + source; //Titles are added to source Code before sending to NLP Service
    var unormform = unorm.nfc(plaintext);
    var endIndex = unormform.length;
    context.uri = '<' + baseUri + '/article/' + articleObject._id + '#char=0,' + endIndex + '> ';
    context.nifExpressions = 'a nif:String , nif:Context , nif:RFC5147String ; ';
    context.nifString = 'nif:isString ' + '"""' + unormform + '"""^^xsd:string; ';
    context.beginindex = 'nif:beginIndex "0"^^xsd:nonNegativeInteger; ';
    context.endIndex = 'nif:endIndex "' + endIndex + '"^^xsd:nonNegativeInteger; ';
    context.identifier = 'dcterms:identifier "' + articleObject._id + '"^^xsd:string ; ';
    context.isPartOf = getBroaderContext(articleObject);
    context.created = 'dcterms:created "' + articleObject.creation_date.toISOString() + '"^^xsd:dateTime ; ';
    context.dateSubmitted = getDateSubmitted(articleObject);
    context.contributor = getContributor(articleObject);
    context.taConfidence = 'itsrdf:taConfidence "' + 0.2 + '"^^xsd:decimal ; ';
    context.title = 'nif:title """' + title + '"""^^xsd:string ; ';
    if (checkIfExist(articleObject.language)) context.language = 'dcterms:language "'+articleObject.language+'"^^dcterms:RFC4646;'
    context.sourceUrl = 'nif:sourceUrl <' + articleObject.uri + '> ; ';
    context.source = 'dcterms:source """' + title + '. '+ source + '"""^^xsd:string ';
    context.end = '. ';

    return context;

}

function nifEntities(entity, articleObject) {

    var nifentity = new Object();
    var unormform = unorm.nfc(entity.name);  //converting to UFT8 NFC to be comptabile with NIF
    var title, source;
    if ((articleObject.source=="undefined") || (articleObject.source==null)) { var source = ""; }
    else{source = sanitizeString(articleObject.source); }

    if (articleObject.title=="undefined" || (articleObject.title==null)) {title = "";}
    else {title = sanitizeString(articleObject.title); }

    var plaintext = title+ '. ' + source;  //Titles are added to source Code before sending to NLP Service. TO be sure that the bein/end calculation works properly
    var utfFormNfcPlaintext = unorm.nfc(plaintext);  //converting to UFT8 NFC to be comptabile with NIF
    var beginindex = utfFormNfcPlaintext.indexOf(unormform,parseInt(entity.offset, 10)-10)+1 ;   //The Offset is not equal to NIF calculation rules so we are recalculating the index. Beginning 5 characters before to not mis the entry
    var endindex = beginindex + unormform.length ;

    nifentity.uri = '<' + baseUri + '/article/' + articleObject._id + '#char=' + beginindex + ',' + endindex + '>';
    nifentity.nifExpressions = 'a nif:String , nif:RFC5147String ;';
    nifentity.word = "a nif:Word;";
    nifentity.referenceContext = 'nif:referenceContext <' + baseUri + '/article/' + articleObject._id + '#char=0' + ',' + utfFormNfcPlaintext.length + '>; ';
    nifentity.anchorOf = 'nif:anchorOf """' + unormform + '"""^^xsd:string ;';
    nifentity.beginindex = 'nif:beginIndex "' + beginindex + '"^^xsd:nonNegativeInteger; ';
    nifentity.endIndex = 'nif:endIndex "' + endindex + '"^^xsd:nonNegativeInteger; ';
    //nifentity.wasConvertedFrom = 'nif:wasConvertedFrom <"'+ 'http://FIXME.com/' +'> '; //TODO add proper was convertedfrom tag
    nifentity.taConfidence = 'itsrdf:taConfidence "' + entity.precision + '"^^xsd:decimal ; ';
    nifentity.identifier = 'dcterms:identifier "' + entity._id + '"^^xsd:string ; ';
    if (checkIfExist(entity.types)) nifentity.taClassRef = getTaClassRef(entity);

    /*entity.types.forEach(function (type) {
        nifentity.taClassRef = nifentity.taClassRef + getTaClassRef(type);
    });*/

    nifentity.taIdentRef = "itsrdf:taIdentRef <" + entity.uri + ">;";
    nifentity.end = '. ';

    return nifentity;
}
function getTaClassRef(entity){
    var output ="";
    for (var i=0; i<entity.types.length; i++){
        output +=getTaClassRefType(entity.types[i]);
        if (i != entity.types.length -1) output +="\n"; //dont add linebreak to the last element
    }
    return output;

}
function getTaClassRefType(type) {

    if (type.substring(0, 8) === "DBpedia:") {
        return "itsrdf:taClassRef <http://dbpedia.org/ontology/" + type.substring(8) + ">;";
    }
    else {
        return "itsrdf:taClassRef <" + type + ">;\n ";
    }

}
function getBroaderContext(articleObject){
    var output ="";
    for (var i=0; i<articleObject.corpusObject.length; i++){
        output +="dcterms:isPartOf <" + baseUri +"/corpus/"+ articleObject.corpusObject[i]._id+">;";
        if (i != articleObject.corpusObject.length -1) output +="\n";
    }
    return output;
}
function getDateSubmitted(articleObject){
    var output ="";
    for (var i=0; i<articleObject.corpusObject.length; i++){
        output +='dcterms:dateSubmitted "' + articleObject.corpusObject[i].creation_date.toISOString()+'"^^xsd:dateTime ;';
        if (i != articleObject.corpusObject.length -1) output +="\n";
    }
    return output;
}

function getContributor(articleObject){
    var output ="";
    for (var i=0; i<articleObject.corpusObject.length; i++){
        output +='dcterms:contributor "' + articleObject.corpusObject[i].userObject.username+'"^^xsd:string ;';
        if (i != articleObject.corpusObject.length -1) output +="\n";
    }
    return output;
}
function sanitizeString(oneString){
    //oneString = S(oneString).escapeHTML().s;
    oneString = S(oneString).stripTags().s
    oneString = oneString.replace(/[\\]/g, " ");
    oneString = oneString.replace(/["]/g, " ");
    return oneString;
}

function checkIfExist(property){
    if ((property != undefined)||(property != null )){
        return true}
    else{
        return false;
    }
}

exports.nifprefix = nifprefix();
exports.articleTonif = function (articleobject){
    return article2nif(articleobject)
}
