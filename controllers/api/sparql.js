var logger = require('../../logger');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var utf8 = require('utf8');
var rdfstore = require("rdfstore");
var config = require('../../config');
var querystring = require ('querystring');
var url = require("url");

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
        sparqlquery = querysplittet;
    }
    else{
        return next(new Error('Error! You have to use GET or POST!'));
    }

    if ((sparqlquery == "undefined")||(sparqlquery === "")){
        res.redirect(302,"/api/sparql/");
        return next;
    }
    rdfstore.create(config.rdfbackendSettings, function (store) {

        //get an Array of Objects of all Graphs
        store.registeredGraphs(function(sucess, graphnames) {
            if (!sucess) {
                return next(new Error('Error! Something ist gone wrong getting the registered graphs!'))
            };
            var graphNamesArray=[];
            var defaultgraph = ["https://github.com/antoniogarrote/rdfstore-js#default_graph"];

            //put the URI of all named graphs to an array
            for (var i in graphnames) {
                graphNamesArray[i] = graphnames[i].nominalValue;
            }

            //Query database
            store.execute(sparqlquery, graphNamesArray, defaultgraph, function (success, results) {
                if (!success) {
                    return next(new Error('Error! Query the Database! '+results))
                };
                logger.info("SPARLQL Query was successfull. "+results.length+' Triple received');

                buildResponseBindings('application/json',results, res);
            });

        });
    });


}



/**
 * Builds an SPARQL HTTP protocol response for a collection of bindings
 * returned by the RDF store
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
 * Escapes XML chars
 */
var xmlEncode = function (data) {
    return data.replace(/\&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;')
        .replace(/>/g, '&' + 'gt;').replace(/\'/g, '&' + 'apos;').replace(/\"/g, '&' + 'quot;');
};


function htmlform(req, res, next){
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.render("sparqlPostRequest.dust");
}
module.exports = function (app) {
    if (config.rdfbackend.sparqlendpoint){
        // export SPARQL Endpoint
        app.get('/api/sparql/', htmlform);
        app.get('/api/sparql/sparqlquery', htmlform);
        app.post('/api/sparql/', sparqlQuery);
        app.get('/api/sparql/*', sparqlQuery);
    }

}