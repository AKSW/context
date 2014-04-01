define([
    'underscore',
    'backbone',
    'string',
    'backbone.facetr',
    'doT!/templates/facetsPanel',
    'doT!/templates/corpusFacets',
], function(_, Backbone, S, Facetr, facetsPanelTemplate, mainTemplate){
    var $el;
    var currentCorpus;
    var facetsData;
    var types, entities, articles;
    var typesFacetr, entitiesFacetr, articlesFacetr;

    var rerenderData = function ($el) {
        // make html
        var articlesHtml = facetsPanelTemplate({title: 'Articles', facets: articles.models, type: 'article'});
        var typesHtml = facetsPanelTemplate({title: 'Types', facets: types.models, type: 'type'});
        var entitiesHtml = facetsPanelTemplate({title: 'Entities', facets: entities.models, type: 'entity'});

        // compile panels
        var panelsHtml = articlesHtml + typesHtml + entitiesHtml;

        // compile template
        var compiledTemplate = mainTemplate({corpus: currentCorpus, panels: panelsHtml, articles: articles.models});
        $el.html(compiledTemplate);

        // enable tooltips
        $('.hasTooltip').tooltip();
    };

    var handleRender = function () {
        // get data
        $.getJSON('/api/corpus/' + currentCorpus.get('_id') + '/facets', function(data) {
            facetsData = data;

            // types
            types = new Backbone.Collection(facetsData.types);
            typesFacetr = new Facetr(types);
            // entities
            entities = new Backbone.Collection(facetsData.entities);
            entitiesFacetr = new Facetr(entities);
            // articles
            articles = new Backbone.Collection(facetsData.articles);
            articlesFacetr = new Facetr(articles);

            // render
            rerenderData($el);
        });
    };

    var handleFacetClick = function(e) {
        var el = $(e.target);
        var enabled = el.hasClass('active');
        var filter = {
            id: el.data('id'),
            name: el.data('name'),
            type: el.data('type'),
        };

        // update filter
        switch(filter.type) {
            case 'article':
                articles.models.every(function(item) {
                    if(item.get('id') === filter.id) {
                        item.set('active', !enabled);
                        return false;
                    }
                    return true;
                });

                if(enabled) {
                    articlesFacetr.facet('id').clear();
                    entitiesFacetr.facet('article').clear();
                    typesFacetr.facet('articles').clear();
                } else {
                    articlesFacetr.facet('id').value(filter.id);
                    entitiesFacetr.facet('article').value(filter.id);
                    typesFacetr.facet('articles').value(filter.id);
                }
                break;
            case 'entity':
                entities.models.forEach(function(item) {
                    if(item.get('id') === filter.id) {
                        item.set('active', !enabled);
                        return false;
                    }
                    return true;
                });

                if(enabled) {
                    entitiesFacetr.facet('id').clear();
                    articlesFacetr.facet('entities').clear();
                    typesFacetr.facet('entities').clear();
                } else {
                    entitiesFacetr.facet('id').value(filter.id);
                    articlesFacetr.facet('entities').value(filter.id);
                    typesFacetr.facet('entities').value(filter.id);
                }
                break;
            case 'type':
                types.models.forEach(function(item) {
                    if(item.get('name') === filter.name) {
                        item.set('active', !enabled);
                        return false;
                    }
                    return true;
                });

                if(enabled) {
                    typesFacetr.facet('name').clear();
                    entitiesFacetr.facet('types').clear();
                    articlesFacetr.facet('types').clear();
                } else {
                    typesFacetr.facet('name').value(filter.name);
                    entitiesFacetr.facet('types').value(filter.name);
                    articlesFacetr.facet('types').value(filter.name);
                }
                break;
        }

        // re-render
        rerenderData($el);
    };

    // view
    var CorpusFacetsView = Backbone.View.extend({
        initialize: function(options) {
            // set element
            this.el = $(options.el);
            $el = this.el;
            // set corpus
            currentCorpus = options.corpus;
        },
        render: handleRender,
        events: {
            'click .facet': handleFacetClick,
        }
    });

    // Our module now returns our view
    return CorpusFacetsView;
});
