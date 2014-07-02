// includes
var ProgressReporter = require('../abstract/progressReporter');
var util = require('util');
// async stuff
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var async2 = require('async');
// promise
var Promise = require('bluebird');
// fs
var fs = require('fs');
// promisified readfile
var readFile = Promise.promisify(fs.readFile);
// logger
var logger = require('../../logger');
var rdfstore = require('rdfstore');
var config = require('../../config');
var courpusId;
// process function
var initStore = function () {
    return new Promise(function (resolve, reject) {
        rdfstore.create({
            persistent: true,
            engine: 'mongodb',
            name: 'turtleimport', // quads in MongoDB will be stored in a DB named myappfunction sanitizeString(oneString){
            overwrite: true, // delete all the data already present in the MongoDB server
            mongoDomain: 'localhost', // location of the MongoDB instance, localhost by default
            mongoPort: 27017 // port where the MongoDB server is running, 27017 by default
        }, function (store) {
            if (store) {
                resolve(store);
            } else {
                reject(new Error('error initing store'));
            }
        });
    });
};

var loadFile = function (turtleFile, store) {
    return new Promise(function (resolve, reject) {
        store.load('text/turtle', turtleFile, function (success, results) {
            if (success) {
                resolve( {store:store, tripplelength:results} );
            } else {
                reject(new Error('error loading file'));
            }
        })
    });
};

var getTripples = function (storeResultarray) {
    var store = storeResultarray.store;
    return new Promise(function (resolve, reject) {
        store.execute('PREFIX ns2:<http://www.w3.org/ns/dcat#> SELECT * WHERE{ ?s ?p ns2:Dataset }', function (success, results) {
            if (success) {
                return resolve({store:store, tripples:results});
            } else {
                console.log("query1 result: " + success);
                reject(new Error('error running query'));
            }
        });
    });
};
var getNodes = function(storeTripples){
    var store = storeTripples.store;
    var myArray = storeTripples.tripples;
    var trippleIndex = 0;
    var tripples = [];
    var tripple;
    var articleObjects = [];
    var output = [];
    return new Promise(function (resolve, reject) {
        async2.whilst(function () {
                tripples = [];
                return trippleIndex < myArray.length;
            },
            function (next) {
                store.execute('PREFIX ns2:<http://www.w3.org/ns/dcat#> SELECT * WHERE{ <' + myArray[trippleIndex].s.value + '> ?p ?o }', function (success, results) {
                    if (success) {

                        results.forEach(function (resulttripple) {
                            tripple = store.rdf.createTriple(myArray[trippleIndex].s.value, resulttripple.p, resulttripple.o);
                            tripples.push(tripple);

                        });

                        output.push(mapper(tripples));
                        trippleIndex++;
                        if (trippleIndex % 500 === 0) console.log("Step: " + trippleIndex);
                        if (trippleIndex === myArray.length) {
                            console.log("done");

                            resolve(output);
                        }
                        next();
                    }
                });
            },
            function (err) {
                // All things are done!
                if (err) console.log("Error! + " + err);
                reject(new Error('error running query'));
            });
    });
}

var process = async(function (corpus) {
    // generate unique url for piece
    var urlBase = 'upload-file:///' + corpus._id.toString() + '/';
    courpusId = corpus._id;
    // init results
    var results = [];

    // get files
    var files = corpus.files;
    var file = files[0];
    var turtleFile = await(readFile(file.path, 'utf8'));
    var loadMyFile = loadFile.bind(this, turtleFile);
    var results = await(initStore().then(loadMyFile).then(getTripples).then(getNodes));
    return results;
});

// module
var FilesProcessing = function () {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'turtle';

    // function
    this.process = process;

    return this;
};



function mapper(tripples){
    //console.log("Ich bin im Mapper!");
    var doc = new Object();
    doc.corpuses = [courpusId];
    tripples.forEach(function(tripple){
        if(tripple.predicate.value === "http://purl.org/dc/terms/description"){
            doc.source =tripple.object.value;
            doc.uri = tripple.subject;
            if ((tripple.object.lang !== "") ||(tripple.object.lang !== "undefined")){
                doc.language = tripple.object.lang;
            }
        }
        else if(tripple.predicate.value === "http://purl.org/dc/terms/title"){
            doc.title =tripple.object.value;
        }
        else{
            //console.log(tripple);
        }

    });

    if ((doc.source==="undefiend") ||(doc.source === null)) doc.source = "";
    return doc;
}
// Inherit from ProgressReporter
util.inherits(FilesProcessing, ProgressReporter);

module.exports = new FilesProcessing();
