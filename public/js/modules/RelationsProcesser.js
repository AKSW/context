var diceMetric = function(x, y, xy) {
    return 2 * xy / (x + y);
};

var getCommonArticles = function(entity, entityDouble) {
    var common = _.intersection(entity.articles, entityDouble.articles);
    return common ? common.length : 0;
};

var processData = function(corpus) {
    // entities array
    var entities = {};
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
        });
    });
    // count average
    entitiesAvg = Math.floor(entitiesTotal / corpus.articles.length);

    // prepare vars for final data
    var relations = [];
    var scores = [];
    var entityNames = [];
    var entityURIs = [];
    var index = 0;
    // temp arrays
    var tmp = [];
    var tmp4 = [];

    // process
    for (var ekey in entities) {
        var entity = entities[ekey];
        // prepare row data
        var row = [];
        var score = [];

        // go through entities again
        for (var ekey2 in entities) {
            var entityDouble = entities[ekey2];
            if (entity.uri === entityDouble.uri) {
                row.push(0);
                score.push(0);
            } else {
                var key = entity._id + '-' + entityDouble._id;
                var reverseKey = entityDouble._id + '-' + entity._id;
                if (tmp.indexOf(key) !== -1) {
                    row.push(tmp[key]);
                    score.push(tmp4[key]);
                } else if (tmp.indexOf(reverseKey) !== -1) {
                    row.push(tmp[reverseKey]);
                    score.push(tmp4[reverseKey]);
                } else {
                    // give me the number of articles that have both  $i ['uri'] and $j ['uri'] entities
                    var commonCount = getCommonArticles(entity, entityDouble);
                    tmp[key] = commonCount;
                    row.push(tmp[key]);
                    tmp4[key] = [diceMetric(entity.articles.length, entityDouble.articles.length, commonCount)];
                    score.push(tmp4[key]);
                }
            }
        }

        // push data if needed
        // push name
        if (entityNames.indexOf(entity.name) === -1) {
            entityNames.push(entity.name);
        } else {
            index++;
            entityNames.push(entity.name + '#' + index);
        }
        // push uri
        entityURIs.push(entity.uri);
        // relations
        relations.push(row);
        // scores
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
        row.forEach(function(score, subindex) {
            if (score < threshold) {
                relations[index][subindex] = 0;
            }
        });
    });

    return {
        relations: relations,
        scores: scores,
        entityNames: entityNames,
        entityURIs: entityURIs
    };
};

exports.processData = processData;
