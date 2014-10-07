var diceMetric = function(x, y, xy) {
    return 2 * xy / (x + y);
};

var getCommonArticles = function(entity, entityDouble) {
    return _.intersection(entity.articles, entityDouble.articles);
};

var processData = function(corpus) {
    // entities array
    var entities = {};
    var types = [];
    // find min, max, avg of entities
    var entitiesMin;
    var entitiesMax;
    var entitiesAvg;
    var entitiesTotal = 0;
    // go through all articles
    corpus.articles.forEach(function(article) {
        // calculate stuff
        var count = article.entities.length;
        entitiesTotal += count;
        entitiesMin = _.min([entitiesMin, count]);
        entitiesMax = _.max([entitiesMin, count]);
        // add entities to all array
        article.entities.forEach(function(entity) {
            if (entities[entity.uri]) {
                entities[entity.uri].count++;
                entities[entity.uri].articles.push(article._id);
            } else {
                entities[entity.uri] = entity;
                entities[entity.uri].count = 1;
                entities[entity.uri].articles = [article._id];
            }
            // fill types
            entity.types.forEach(function(type) {
                if (types.indexOf(type) === -1) {
                    types.push(type);
                }
            });
        });
    });
    // count average
    entitiesAvg = Math.floor(entitiesTotal / corpus.articles.length);

    // filter out entities
    var filteredEntities = {};
    for (var ekey in entities) {
        var ent = entities[ekey];
        if (ent.count > entitiesAvg) {
            filteredEntities[ekey] = ent;
        }
    }
    entities = filteredEntities;

    // prepare vars for final data
    var nodes = [];
    var links = [];
    var groups = [];
    var scores = [];
    var entityNames = [];
    var entityURIs = [];
    var index = 0;
    // temp arrays
    var tmp = [];

    // process
    var entity;
    for (var ekey in entities) {
        entity = entities[ekey];
        // push uri
        entityURIs.push(entity.uri);
        // get type
        var type = entity.types[0];
        var typeId = types.indexOf(type);
        groups[typeId] = type;
        // push data
        if (entityNames.indexOf(entity.name) === -1) {
            entityNames.push(entity.name);
            nodes.push({
                name: entity.name,
                uri: entity.uri,
                group: typeId
            });
        } else {
            index++;
            entityNames.push(entity.name + '#' + index);
            nodes.push({
                name: entity.name + '#' + index,
                uri: entity.uri,
                group: typeId
            });
        }
    }

    // process
    for (ekey in entities) {
        entity = entities[ekey];
        // prepare row data
        var score = [];

        // go through entities again
        for (var ekey2 in entities) {
            var entityDouble = entities[ekey2];
            if (entity.uri !== entityDouble.uri) {
                var key = entity._id + '-' + entityDouble._id;
                var reverseKey = entityDouble._id + '-' + entity._id;
                if (tmp.indexOf(key) === -1 && tmp.indexOf(reverseKey) === -1) {
                    // give me the number of articles that have both  $i ['uri'] and $j ['uri'] entities
                    var common = getCommonArticles(entity, entityDouble);
                    var scoreValue = [diceMetric(entity.articles.length,
                        entityDouble.articles.length, common.length)];
                    score.push(scoreValue);
                    links.push({
                        source: entityURIs.indexOf(entity.uri),
                        target: entityURIs.indexOf(entityDouble.uri),
                        value: common ? common.length : 0,
                        articles: common
                    });
                }
            }
        }

        // push scores
        scores.push(score);
    }

    // get threshold from middle of scores
    var sortedScores = [];
    // get scores
    scores.forEach(function(score) {
        score.forEach(function(num) {
            if (num > 0) {
                sortedScores.push(num[0]);
                threshold += num;
            }
        });
    });
    // sort
    sortedScores = sortedScores.sort();
    // get threshold
    var center = Math.floor(sortedScores.length / 2);
    var threshold = sortedScores[center];

    // remove noises
    scores.forEach(function(row, index) {
        if (score < threshold) {
            links[index].value = 0;
            links[index].articles = '';
        }
    });

    return {
        nodes: nodes,
        links: links,
        groups: groups
    };
};

exports.processData = processData;
