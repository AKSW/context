var rdfstore = require("rdfstore");
var logger = require('../logger');
var rdf = require('rdf');
var fs = require('fs');

module.exports = function(app) {

    new rdfstore.Store({persistent: true,
        engine: 'mongodb',
        name: 'rdfbackend', // quads in MongoDB will be stored in a DB named myappstore
        overwrite: false,    // delete all the data already present in the MongoDB server
        mongoDomain: 'localhost', // location of the MongoDB instance, localhost by default
        mongoPort: 27017 // port where the MongoDB server is running, 27017 by default
    }, function mystore (store, ttlString) {
        logger.info("Rdf Store initialisation complete");
        /*
        store.execute("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            DELETE WHERE { GRAPH <https://github.com/antoniogarrote/rdfstore-js#default_graph> {  <http://127.0.0.1:8080/context/article/537cc523f1aa781c0efdfbc0#char=0,1341> ?p ?o . } \
        }", function(success, results) {
            debugger;
            console.log(results);
            console.log(success);
*/
        var gaphuritodelete = "http://127.0.0.1:8080/context/article/537cc523f1aa781c0efdfbc7";
        store.clear(gaphuritodelete, function (success){
            console.log(success);
        });
        store.graph("http://127.0.0.1:8080/context/article/fgfdgdfgdfg", function (success,data){
            debugger;
            console.log(success);
            console.log(data);
        });
        //var graphUri = "https://github.com/antoniogarrote/rdfstore-js#default_graph";
        //debugger;
        /*store.clear(graphUri, function(graph){
            // process graph
            //debugger;
            console.log(graph);
        });*/
        /*store.node("http://127.0.0.1:8080/context/article/537cc523f1aa781c0efdfbc0", graphUri, function(data, bla){
            //debugger;
            console.log(data);
            console.log(bla);
        });*/
//            FILTER(?termid CONTAIN \"537cc523f1aa781c0efdfbc0\")\
        //var test = fs.readFileSync('tests/nif-data2.ttl', 'utf8');
//DELETE WHERE { GRAPH <https://github.com/antoniogarrote/rdfstore-js#default_graph> {  <http://127.0.0.1:8080/context/article/537cc523f1aa781c0efdfbc0#char=0,1341> ?p ?o . } }

            //console.log(data);
        //var turtleParser = new rdf.TurtleParser();
        //console.log(typeof (data));
        //var bla = new rdf.TripletGraph;
       /* var query = "PREFIX dcterms: <http://purl.org/dc/terms/>\
            SELECT ?s
        ";
        store.execute("SELECT ?s WHERE { ?s <http://127.0.0.1:8080/context/article/537cc523f1aa781c0efdfbcf>}", function(success, results) {
            console.log(results);
            console.log(success);
            if (success) {
                // process results
                if (results[0].s.token === 'uri') {
                    console.log(results[0].s.value);
                }
            }
        });*/
        //turtleParser.parse(test, undefined, undefined, null, bla);

        //debugger;
        /*var mybla = store.insert(test,"http://example.com",function(success) {
            console.log(success);
        });
        console.log(mybla);*/
        //store.load("text/turtle", test, function(success, results) {});


    //});
});
};
