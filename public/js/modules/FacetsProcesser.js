var escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

var processData = function(data) {
    // articles
    var articles = [];
    // types
    var types = [];
    var typeNames = [];
    // entities
    var entities = [];
    var entityNames = [];

    // extract data
    data.articles.forEach(function(item) {
        // get article data
        var title = '';
        try {
            var dom = $(item.source);
            title = item.title || dom.text();
        } catch(e) {
            title = item.source;
        }
        title = title.slice(0, 30) + '...';
        var article = {
            id: item._id,
            name: title,
            type: 'article',
            count: 0,
            entities: [],
            types: [],
            source: item.source,
        };

        // get article plain text
        var sourceText = S(item.source).stripTags().s;
        // split plain text and full source into words
        var srcText = sourceText.split(/\s/);
        var src = item.source.split(/\s/);
        // split using additional characters for better processing
        for(var i = 0; i < srcText.length; i++) {
            var it = srcText[i];
            it = it.split('/');
            srcText[i] = it;
        }
        // flatten arrays
        srcText = _.flatten(srcText);

        var findSourceIndex = function(word, cleanWord, entityName, startIndex) {
            startIndex = startIndex || -1;
            // try to get plain match from original source
            var sourceIndex = src.indexOf(word, startIndex);
            // if not found, find by string
            if(sourceIndex === -1) {
                //if(entityName === testEntity) console.log('searching index in array');
                for(var i = 0; i < src.length; i++){
                    var srcWord = src[i];
                    // clean from hrefs
                    var srcWordClean = srcWord.replace(/href="(.+?)"(.*?>?)/, '').replace(/src="(.+?)"(.*?>?)/, '').replace(/alt="(.+?)"(.*?>?)/, '');
                    // skip if containes marking parts
                    if(srcWordClean.indexOf('span%marked%') !== -1) {
                        continue;
                    }

                    // check for match
                    if(srcWordClean.match(new RegExp(matchRegStart+escapeRegExp(cleanWord)+matchReg)) && i >= startIndex) {
                        sourceIndex = i;
                        break;
                    }
                }
            }

            return sourceIndex;
        };

        var cleanReg = /(^[\W]+)|([\W]+$)/g;
        var matchRegStart = '';
        var matchReg = '(\\W?)';

        // get entities
        item.entities.forEach(function(entity){
            var entityParts = entity.name.split(' ');

            // if only one word
            if(entityParts.length === 1) {
                // find word that matches current entity
                srcText.forEach(function(word, index) {
                    // clean word from commas, dots and other suplementary stuff
                    var cleanWord = word.replace(cleanReg, '');
                    var entityClean = entity.name.replace(cleanReg, '');

                    // cehck match
                    if(cleanWord === entity.name || word === entity.name) {
                        // get match from original source
                        var sourceIndex = findSourceIndex(word, cleanWord, entity.name);
                        // if word was found
                        if(sourceIndex !== -1) {
                            var origSrc = src[sourceIndex];
                            var link = origSrc.match(/href="(.+?)"/);
                            var img = origSrc.match(/src="(.+?)"/);
                            var alt = origSrc.match(/alt="(.+?)"/);
                            if(link) {
                                link = link[1];
                                origSrc = origSrc.replace(link, '%link%');
                            }
                            if(img) {
                                img = img[1];
                                origSrc = origSrc.replace(img, '%img%');
                            }
                            if(alt) {
                                alt = alt[1];
                                origSrc = origSrc.replace(alt, '%alt%');
                            }

                            // enrich source
                            src[sourceIndex] = origSrc.replace(
                                entity.name,
                                '<span%marked% class="label label-warning hasTooltip" data-toggle="tooltip" title="' +
                                entity.types.join(' ') + '">' + entity.name + '</span%marked%>'
                            );

                            if(link) {
                                src[sourceIndex] = src[sourceIndex].replace('%link%', link);
                            }
                            if(img) {
                                src[sourceIndex] = src[sourceIndex].replace('%img%', img);
                            }
                            if(alt) {
                                src[sourceIndex] = src[sourceIndex].replace('%alt%', alt);
                            }
                        }

                        return;
                    }
                });
            } else {
                // check match
                var firstWord = entityParts[0];
                var lastWord = entityParts[entityParts.length-1];
                // find word that matches current entity
                srcText.forEach(function(word, index) {
                    // clean word from commas, dots and other suplementary stuff
                    var cleanWord = word.replace(cleanReg, '');
                    if(cleanWord.indexOf('span%marked%') !== -1) {
                        return;
                    }
                    // test match
                    var match = firstWord.match(new RegExp(matchRegStart+escapeRegExp(cleanWord)+matchReg)) !== null;
                    if(match) {
                        var i = 0;
                        for(i = 1; i < entityParts.length; i++) {
                            if(index+i >= srcText.length) {
                                continue;
                            }

                            var nextCleanWord = srcText[index+i].replace(cleanReg, '');
                            if(nextCleanWord.indexOf('span%marked%') !== -1) {
                                continue;
                            }
                            match = match && entityParts[i].match(new RegExp(matchRegStart+escapeRegExp(nextCleanWord)+matchReg)) !== null;
                        }

                        // check complete match
                        if(match) {
                            // Replace first part
                            // get match from original source
                            var sourceStartIndex = findSourceIndex(word, cleanWord, firstWord, index);

                            // Replace end part
                            var endIndex = index+entityParts.length-1;
                            if(endIndex >= srcText.length) {
                                return;
                            }
                            var endWord = srcText[endIndex];
                            var endCleanWord = endWord.replace(/[^\w]/, '');
                            // try to get plain match from original source for start
                            var sourceEndIndex = findSourceIndex(endWord, endCleanWord, lastWord, endIndex);

                            // if word was found
                            if(sourceStartIndex !== -1 && sourceEndIndex !== -1 && Math.abs(sourceStartIndex - sourceEndIndex) < 5) {
                                // enrich source
                                src[sourceStartIndex] = src[sourceStartIndex].replace(
                                    new RegExp(escapeRegExp(firstWord)+'$'),
                                    '<span%marked% class="label label-warning hasTooltip" data-toggle="tooltip" title="' +
                                    entity.types.join(' ') + '">' + firstWord
                                );

                                // enrich source
                                src[sourceEndIndex] = src[sourceEndIndex].replace(lastWord, lastWord + '</span%marked%>');
                            }
                        }
                        return;
                    }
                });
            }

            // get entity data
            var ind = entityNames.indexOf(entity.name);
            var newEntity;
            if(ind !== -1) {
                newEntity = entities[ind];
                entities[ind].count += 1;
                if(entities[ind].articles.indexOf(article.id) === -1) {
                    entities[ind].articles.push(article.id);
                }
                if(article.entities.indexOf(newEntity.id) === -1) {
                    article.entities.push(newEntity.id);
                }
            } else {
                newEntity = {
                    id: entity._id,
                    name: entity.name,
                    type: 'entity',
                    count: 1,
                    articles: [article.id],
                    types: []
                };
                article.entities.push(newEntity.id);
            }

            // get types
            entity.types.forEach(function(type){
                // get type data
                var name = type.split(':')[1];
                var tid = 'type_'+name;
                var ind = typeNames.indexOf(name);
                if(ind !== -1) {
                    types[ind].count += 1;
                    types[ind].entities.push(newEntity.id);
                    types[ind].articles.push(article.id);
                    if(newEntity.types.indexOf(tid) === -1) {
                        newEntity.types.push(tid);
                    }
                    if(article.types.indexOf(tid) === -1) {
                        article.types.push(tid);
                    }
                } else {
                    types.push({
                        id: tid,
                        name: name,
                        type: 'type',
                        count: 1,
                        entities: [newEntity.id],
                        articles: [article.id],
                    });
                    if(newEntity.types.indexOf(tid) === -1) {
                        newEntity.types.push('type_'+name);
                    }
                    if(article.types.indexOf(tid) === -1) {
                        article.types.push('type_'+name);
                    }
                    typeNames.push(name);
                }
            });

            if(ind === -1) {
                entities.push(newEntity);
                entityNames.push(newEntity.name);
            }
        });

        // join source back
        item.source = src.join(' ').replace(/span%marked%/g, 'span');
        article.source = item.source;

        // push to array
        articles.push(article);
    });

    // sort arrays by count
    var sortFunction = function(a, b) {
        return b.count - a.count;
    };
    entities = entities.sort(sortFunction);
    types = types.sort(sortFunction);

    return {
        articles: articles,
        types: types,
        entities: entities
    };
};

// expose
exports.processData = processData;
