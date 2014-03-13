// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');

// service url
var FoxUrl = 'http://139.18.2.164:4444/api';

var FoxTypes = {
    'http://ns.aksw.org/scms/annotations/PERSON': 'DBpedia:Person',
    'http://ns.aksw.org/scms/annotations/LOCATION': 'DBpedia:Place',
    'http://ns.aksw.org/scms/annotations/ORGANIZATION': 'DBpedia:Organization',
    'http://www.w3.org/2000/10/annotation-ns#Annotation': 'DBpedia:Misc',
};

// process function
var process = function(sourceText, endCallback) {
    // default headers
    var headers = {'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json'};
    // form data
    var data = {
        input: sourceText,
        type: 'text',
        foxlight: true,
        output: 'JSONLD',
        task: 'NER'
    };
    // form request options
    var options = {
        url: FoxUrl,
        headers: headers,
        method: 'POST',
        form: data,
    };

    // get data
    request(options, function(error, response, body){
        if (error) {
            return console.log('error loading Fox', error);
        }

        // form response
        var result = {
            annotation: body,
            entities: [],
        };

        // parse json
        var out = '';
        try {
            // get decoded output
            out = decodeURIComponent(JSON.parse(body)[0].output);
            // parse json
            out = JSON.parse(out);
        } catch (e) {
            console.log('error parsing', body);
        }

        // process resources
        out.forEach(function(resource) {
            if(resource['http://www.w3.org/2000/10/annotation-ns#body']) {
                // create new entity
                var entity = {
                    types: [resource['@type'][0]],
                    name: resource['http://www.w3.org/2000/10/annotation-ns#body'][0]['@value'],
                    uri: resource['http://ns.aksw.org/scms/means'][0]['@id'],
                    offset: resource['http://ns.aksw.org/scms/beginIndex'][0]['@value'],
                    precision: -1, // TODO: does FOX provides it?
                };

                // append entity to result
                result.entities.push(entity);
            }
        });

        return endCallback(null, result);
    });
};

// module
var FOXAnnotation = function () {
    // Super constructor
    EventEmitter.call( this );

    // name (also ID of processer used in client)
    this.name = 'FOX';

    // function
    this.process = process;

    return this;
};

module.exports = new FOXAnnotation();