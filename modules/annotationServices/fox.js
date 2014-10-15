// includes
// async-await fetures
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// promise
var Promise = require('bluebird');
// promisified request
var request = Promise.promisify(require('request'));
// lodash
var _ = require('lodash');
// logger
var logger = require('../../logger');

// service url
var FoxUrl = 'http://139.18.2.164:4444/api';

/*var FoxTypes = {
    'http://ns.aksw.org/scms/annotations/PERSON': 'DBpedia:Person',
    'http://ns.aksw.org/scms/annotations/LOCATION': 'DBpedia:Place',
    'http://ns.aksw.org/scms/annotations/ORGANIZATION': 'DBpedia:Organization',
    'http://www.w3.org/2000/10/annotation-ns#Annotation': 'DBpedia:Misc',
};*/

// default headers
var defaultHeaders = {
    'content-type': 'application/x-www-form-urlencoded',
    accept: 'application/json'
};

// default form data
var defaultData = {
    type: 'text',
    // foxlight: true,
    output: 'JSON-LD',
    task: 'NER'
};

// default form request options
var defaultOptions = {
    url: FoxUrl,
    headers: defaultHeaders,
    method: 'POST',
};

// process function
var process = async(function(sourceText) {
    // form data
    var data = _.extend(defaultData, {
        input: sourceText
    });
    // form request options
    var options = _.extend(defaultOptions, {
        form: data
    });

    // get data
    var resp = await(request(options));
    var body = resp[1];

    // form response
    var result = {
        annotation: body,
        entities: [],
    };

    // parse json
    var out = '';
    try {
        var jsonBody = JSON.parse(body);
        var output = jsonBody.output;
        // get decoded output
        out = decodeURIComponent(output);
        // parse json
        out = JSON.parse(out)['@graph'];
    } catch (e) {
        logger.error('error parsing', body);
    }

    // process resources
    out.forEach(function(resource) {
        if (resource['ann:body']) {
            // create new entity
            var entity = {
                types: [resource['@type'][0]],
                name: resource['ann:body'],
                uri: resource['@id'],
                offset: parseInt(resource.beginIndex, 10),
                precision: -1, // TODO: does FOX provides it?
            };

            // append entity to result
            result.entities.push(entity);
        }
    });

    return result;
});

// module
var FOXAnnotation = function() {
    // name (also ID of processer used in client)
    this.name = 'FOX';

    // function
    this.process = process;

    return this;
};

module.exports = new FOXAnnotation();
