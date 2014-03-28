// includes
var EventEmitter = require('events').EventEmitter;
var request = require('request');

// service url
var SpotlightUrl = 'http://de.dbpedia.org/spotlight/rest/annotate';

// process function
var process = function(sourceText, endCallback) {
    // default headers
    var headers = {'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json'};
    // form data
    var data = {
        text: sourceText,
        confidence: 0.20,
        support: 20
    };
    // form request options
    var options = {
        url: SpotlightUrl,
        headers: headers,
        method: 'POST',
        form: data,
    };

    // get data
    request(options, function(error, response, body){
        if (error) {
            return console.log('error loading DBpedia-Spotlight', error);
        }

        // form response
        var result = {
            annotation: body,
            entities: [],
        };

        // parse json
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.log('error parsing', body);
        }

        // process resources
        if(body.Resources) {
            body.Resources.forEach(function(resource) {
                // create new entity
                var entity = {
                    name: resource['@surfaceForm'],
                    uri: resource['@URI'],
                    offset: resource['@offset'],
                    precision: resource['@similarityScore'],
                };

                // get entity types
                var types = [];
                if(resource['@types'] && resource['@types'] !== '') {
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

        return endCallback(null, result);
    });
};

// module
var DBPediaAnnotation = function () {
    // Super constructor
    EventEmitter.call( this );

    // name (also ID of processer used in client)
    this.name = 'DBpedia-Spotlight-DE';

    // function
    this.process = process;

    return this;
};

module.exports = new DBPediaAnnotation();