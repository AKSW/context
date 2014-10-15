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
var SpotlightUrl = 'http://context.aksw.org/spotlight_clone.php';

// default headers
var defaultHeaders = {
    'content-type': 'application/x-www-form-urlencoded',
    accept: 'application/json'
};

// default form data
var defaultData = {
    confidence: 0.20,
    support: 20
};

// default options
var defaultOptions = {
    url: SpotlightUrl,
    headers: defaultHeaders,
    method: 'POST',
};

// process function
var process = async(function(sourceText) {
    // form data
    var data = _.extend(defaultData, {
        text: sourceText
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
    try {
        body = JSON.parse(body);
    } catch (e) {
        logger.error('error parsing', body);
    }

    // process resources
    if (body.Resources) {
        body.Resources.forEach(function(resource) {
            // create new entity
            var entity = {
                name: resource['@surfaceForm'],
                uri: resource['@URI'],
                offset: parseInt(resource['@offset'], 10),
                precision: parseFloat(resource['@similarityScore']),
            };

            // get entity types
            var types = [];
            if (resource['@types'] && resource['@types'] !== '') {
                // split coma separated types
                var tmpTypes = resource['@types'].split(',');
                // only pick types with DBpedia prefix
                types = tmpTypes.filter(function(item) {
                    var prefix = item.split(':')[0];
                    return prefix === 'DBpedia';
                });
            } else {
                // use misc by default
                types.push('DBpedia:Misc');
            }
            // assing type to new entity
            entity.types = types;
            // append entity to result
            result.entities.push(entity);
        });
    }

    return result;
});

// module
var DBPediaAnnotation = function() {
    // name (also ID of processer used in client)
    this.name = 'DBpedia-Spotlight';

    // function
    this.process = process;

    return this;
};

module.exports = new DBPediaAnnotation();
