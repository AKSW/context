var logger = require('../../logger');
var rdfstore = require("rdfstore");
var config = require('../../config');
var url = require("url");
var S = require('string');

function sparqlQuery(req, res, next){

    var sparqlquery;
    var querysplittet;
    var outputFormat ;

    if (req.method == "GET"){
        querysplittet =req.url.split("query=");
        sparqlquery = decodeURIComponent(querysplittet[1]);

    }
    else if (req.method == "POST"){
        querysplittet = req.body['query'];
        outputFormat = req.body['outputformat'];
        sparqlquery = querysplittet;
    }
    else{
        return next(new Error('Error! You have to use GET or POST!'));
    }

    //Redirect to Querywebform if query is empty
    if ((sparqlquery == "undefined")||(sparqlquery === "")){
        res.redirect(302,"/api/sparql/");
        return next;
    }
    //checking for illegal Operations DELETE/CLEAR ....
    if (queryHasIllegalStatements(sparqlquery)){
        res.send("Illegal Operation. Changing Operations are now allowed");
        return;
    }
    if(outputFormat =="json"){
        outputFormat = "application/json";
    }
    else{
        outputFormat = "application/rdf+xml";
    }

    rdfstore.create(config.rdfbackendSettings, function (store) {

        //get an Array of Objects of all Graphs
        store.registeredGraphs(function(sucess, graphnames) {
            if (!sucess) {
                return next(new Error('Error! Something ist gone wrong getting the registered graphs!'))
            }
            var graphNamesArray=[];
            var defaultgraph = ["https://github.com/antoniogarrote/rdfstore-js#default_graph"];

            //put the URI of all named graphs to an array
            for (var i in graphnames) {
                graphNamesArray[i] = graphnames[i].nominalValue;
            }

            //Query database
            store.execute(sparqlquery, graphNamesArray, defaultgraph, function (success, results) {
                if (!success) {
                    res.send("Error: "+results);
                    return ;
                }
                logger.info("SPARLQL Query was successfull. "+results.length+' Triple received');

                buildResponseBindings(outputFormat,results, res);
            });

        });
    });


}



/**
 * Builds an SPARQL HTTP protocol response for a collection of bindings
 * returned by the RDF store
 * Adapted from Server.js in rdfstore
 * https://github.com/antoniogarrote/rdfstore-js/blob/master/src/js-store/src/server.js
 */
var buildResponseBindings = function(mediaTypes, bindings, res) {
    var accepts;

    if(mediaTypes === 'application/json') {
        accepts = mediaTypes;
    }
    else{
        accepts = 'application/rdf+xml';
    }
    if(accepts === 'application/json') {
        var varNames = {};
        var genBindings = [];
        for(var i=0; i<bindings.length; i++) {
            var result = bindings[i];
            for(var p in bindings[i]) {
                varNames[p] = true;
            }
        }
        var head = {'variables':[]};
        for(var p in varNames) {
            head['variables'].push({'name':p});
        }
        res.writeHead(200,{"Content-Type":"application/json"});

        res.end(new Buffer(JSON.stringify({'head':head,'results':bindings},null, '\t')), 'utf-8');
    } else {
        var response = '<?xml version="1.0" encoding="UTF-8"?><sparql xmlns="http://www.w3.org/2005/sparql-results#">';
        var results = '<results>';

        var varNames = {};
        for(var i=0; i<bindings.length; i++) {
            var nextResult = '<result>';

            var result = bindings[i];

            for(var p in result) {
                varNames[p] = true;
                nextResult = nextResult+'<binding name="'+xmlEncode(p)+'">';
                if(result[p].token === 'uri') {
                    nextResult = nextResult+"<uri>"+result[p].value+"</uri>";
                } else if(result[p].token === 'literal') {
                    nextResult = nextResult+"<literal ";
                    if(result[p].lang != null ) {
                        nextResult = nextResult + ' xml:lang="'+result[p].lang+'" ';
                    }
                    if(result[p].type != null ) {
                        nextResult = nextResult + ' datatype="'+result[p].type+'" ';
                    }
                    nextResult = nextResult+">"+xmlEncode(result[p].value)+"</literal>";
                } else {
                    nextResult = nextResult+"<bnode>"+result[p].value+"</bnode>";
                }
                nextResult = nextResult+'</binding>';
            }

            nextResult = nextResult+'</result>';
            results = results+nextResult;
        }
        results = results + '</results>';

        var head = '<head>';
        for(var varName in varNames) {
            head = head + '<variable name="'+xmlEncode(varName)+'"/>';
        }
        head = head + '</head>';

        response = response + head + results + '</sparql>';
        res.writeHead(200,{"Content-Type":"application/sparql-results+xml"});
        res.end(new Buffer(response), 'utf-8');
    }

};
/**
 * Builds an SPARQL HTTP protocol response for a boolean value
 * returned by the RDF store
 * Adapted from Server.js in rdfstore
 * https://github.com/antoniogarrote/rdfstore-js/blob/master/src/js-store/src/server.js
 */
var buildResponseBoolean = function(mediaTypes, boolValue, res) {
    var accepts;

    if(mediaTypes === 'application/json') {
        accepts = mediaTypes;
    }
    else{
        accepts = 'application/rdf+xml';
    }

    if(accepts === 'application/json') {

        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(new Buffer(JSON.stringify({'head':{},'boolean':boolValue})), 'utf-8');

    } else
    {
        var response = '<?xml version="1.0" encoding="UTF-8"?><sparql xmlns="http://www.w3.org/2005/sparql-results#"><head></head><boolean>'+boolValue+'</boolean></sparql>';
        res.writeHead(200,{"Content-Type":"application/sparql-results+xml"});
        res.end(new Buffer(response), 'utf-8');
    }
};


/**
 * Escapes XML chars
 */
var xmlEncode = function (data) {
    return S(data).escapeHTML().s;
};


function htmlform(req, res, next){
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.render("sparqlPostRequest.dust");
}

function queryHasIllegalStatements(sparqlquery) {
    var illegal = false;
    if (config.rdfbackendSettings.sparqlUpdateOperations === true) return false;
    var illegalStatemens =["delete", "insert", "load","create","drop","clear"];
    var sparqlquerylowerCase = sparqlquery.toLowerCase();
    illegalStatemens.forEach(function (statement){
        if (sparqlquerylowerCase.indexOf(statement,0)!== -1){
            illegal = true;
        }
    });
    return illegal;
}
module.exports = function (app) {
    if (config.rdfbackend.sparqlendpoint){
        // export SPARQL Endpoint
        app.get('/api/sparql/', htmlform);
        app.post('/api/sparql/', sparqlQuery);
        app.get('/api/sparql/*', sparqlQuery);
        app.get('/sparql/', htmlform);
        app.post('/sparql/', sparqlQuery);
        app.get('/sparql/*', sparqlQuery);

    }

}