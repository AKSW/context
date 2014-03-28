define([
    'underscore',
    'backbone',
    'string',
    'doT!/templates/facetsPanel',
    'doT!/templates/corpusFacets',
], function(_, Backbone, S, facetsPanelTemplate, mainTemplate){
    var currentCorpus;

    var escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    // view
    var CorpusFacetsView = Backbone.View.extend({
        initialize: function(options) {
            // set element
            this.el = $(options.el);
            // set corpus
            currentCorpus = options.corpus;
        },
        render: function(){
            var that = this;

            // get data
            $.getJSON('/api/corpus/' + currentCorpus.get('_id') + '/facets', function(data) {
                console.log(data);
                // prepare data
                var panelsHtml = '';
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
                    var dom = $(item.source);
                    var title = $('extracted-title', dom).text() || dom.text();
                    title = title.slice(0, 30) + '...';
                    articles.push({
                        id: item._id,
                        name: title,
                        count: 0,
                    });

                    console.log('--------------------- PROCESSING NEW ARTICLE ------------------------');
                    console.log('------> Article has ', item.entities.length, 'entites');

                    // join source back
                    //console.log(item.source);

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

                    var testEntity = 'er';// 'Roanoke';

                    var findSourceIndex = function(word, cleanWord, entityName, startIndex) {
                        startIndex = startIndex || -1;
                        //if(entityName === testEntity) console.log('looking for ', testEntity);
                        // try to get plain match from original source
                        var sourceIndex = src.indexOf(word, startIndex);
                        //if(entityName === testEntity) console.log('got index ', sourceIndex);
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

                                // debug
                                if(entityName === testEntity){
                                    //console.log(word, cleanWord, srcWordClean);
                                    if(srcWordClean.indexOf(cleanWord) !== -1) {
                                        console.log('found match!', srcWordClean, src[i-1], src[i], src[i+1]);
                                    }
                                }

                                // check for match
                                //if(entityName === testEntity) console.log('matching: ', srcWordClean.match(new RegExp(cleanWord+'(\W?)')));
                                if(srcWordClean.match(new RegExp(matchRegStart+escapeRegExp(cleanWord)+matchReg)) && i >= startIndex) {
                                    //console.log('----> found', cleanWord, 'in', srcWordClean, 'with icomp', startIndex, i, i >= startIndex);
                                    sourceIndex = i;
                                    break;
                                }
                            }
                        }

                        return sourceIndex;
                    };

                    var cleanReg = /(^[\W]+)|([\W]+$)/g;
                    var matchRegStart = '';
                    var matchReg = '(\W?)';

                    // get entities
                    item.entities.forEach(function(entity){
                        //console.log('------>>> Entity: ', entity.name);
                        var entityParts = entity.name.split(' ');

                        if(entity.name === testEntity) console.log('--->>> test ', entity.name, srcText.indexOf(entity.name));

                        // if only one word
                        if(entityParts.length === 1) {
                            // find word that matches current entity
                            srcText.forEach(function(word, index) {
                                // clean word from commas, dots and other suplementary stuff
                                var cleanWord = word.replace(cleanReg, '');
                                var entityClean = entity.name.replace(cleanReg, '');

                                // cehck match
                                //if(entity.name === testEntity) console.log('--->>> matching ', word, cleanWord);
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
                                            //if(entity.name === testEntity) console.log('--->>> link found ', link);
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

                                        //console.log('--------> replacing', word, 'with', entity.name);
                                        //console.log('--------> replacing in', src[sourceIndex-1], src[sourceIndex], src[sourceIndex+1]);

                                        // enrich source
                                        src[sourceIndex] = origSrc.replace(
                                            entity.name,
                                            '<span%marked% class="label label-warning hasTooltip" data-toggle="tooltip" title="' +
                                            entity.types.join(' ') + '">' + entity.name + '</span%marked%>'
                                        );

                                        //console.log('--------> replaced', src[sourceIndex]);

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
                            //console.log('---->>> multipart check');
                            // check match
                            var firstWord = entityParts[0];
                            var lastWord = entityParts[entityParts.length-1];
                            //console.log('---->>> first word: ', firstWord);
                            //console.log('---->>> last word: ', lastWord);
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
                                    //console.log('---->>> first word match: ', match, index);
                                    //console.log('---->>> match seq: ', srcText[index-1], srcText[index], srcText[index+1]);
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
                                        //if(entityParts[i] === testEntity) console.log('matching: ', nextCleanWord, entityParts[i], entityParts[i].match(new RegExp(nextCleanWord+'(\W?)')) !== null)
                                    }

                                    // check complete match
                                    if(match) {
                                        //console.log('---->>> complete match!', entity.name, index);
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
                                            // log
                                            //console.log('---->>>>>> replacing start', firstWord, index, 'at', sourceStartIndex);
                                            //console.log('---->>>>>> replacing data', firstWord, src[sourceStartIndex-1], src[sourceStartIndex], src[sourceStartIndex+1]);
                                            //console.log('---->>>>>> replacing end', lastWord, endIndex, 'at', sourceEndIndex);
                                            //console.log('---->>>>>> replacing end data', endWord, src[sourceEndIndex]);
                                            //console.log('---->>>>>> replacing with', lastWord);

                                            // enrich source
                                            src[sourceStartIndex] = src[sourceStartIndex].replace(
                                                new RegExp(escapeRegExp(firstWord)+'$'),
                                                '<span%marked% class="label label-warning hasTooltip" data-toggle="tooltip" title="' +
                                                entity.types.join(' ') + '">' + firstWord
                                            );

                                            // enrich source
                                            src[sourceEndIndex] = src[sourceEndIndex].replace(lastWord, lastWord + '</span%marked%>');
                                            //console.log('---->>> replaced', src[sourceEndIndex], sourceEndIndex);
                                        }
                                    }
                                    return;
                                }
                            });
                        }

                        // get entity data
                        var ind = entityNames.indexOf(entity.name);
                        if(ind !== -1) {
                            entities[ind].count += 1;
                        } else {
                            entities.push({
                                id: entity._id,
                                name: entity.name,
                                count: 1,
                            });
                            entityNames.push(entity.name);
                        }

                        // get types
                        entity.types.forEach(function(type){
                            // get type data
                            var name = type.split(':')[1];
                            var ind = typeNames.indexOf(name);
                            if(ind !== -1) {
                                types[ind].count += 1;
                            } else {
                                types.push({
                                    name: name,
                                    count: 1,
                                });
                                typeNames.push(name);
                            }
                        });
                    });

                    // join source back
                    item.source = src.join(' ').replace(/span%marked%/g, 'span');
                    //console.log(item.source);
                });

                // sort arrays by count
                var sortFunction = function(a, b) {
                    return b.count - a.count;
                };
                entities = entities.sort(sortFunction);
                types = types.sort(sortFunction);


                // make html
                var articlesHtml = facetsPanelTemplate({title: 'Articles', facets: articles});
                var typesHtml = facetsPanelTemplate({title: 'Types', facets: types});
                var entitiesHtml = facetsPanelTemplate({title: 'Entities', facets: entities});

                // compile panels
                panelsHtml = articlesHtml + typesHtml + entitiesHtml;

                // compile template
                var compiledTemplate = mainTemplate({corpus: currentCorpus, panels: panelsHtml, articles: data.articles});
                that.$el.html(compiledTemplate);

                // enable tooltips
                $('.hasTooltip').tooltip();
            });
        },
    });

    // Our module now returns our view
    return CorpusFacetsView;
});
