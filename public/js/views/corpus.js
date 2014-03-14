define([
    'underscore',
    'backbone',
    'models/corpus',
    'data/corpusExtentionViewCollection',
    'text!/templates/corpusView.html',
], function(_, Backbone, CorpusModel, corpusExtentionViewCollection, corpusTemplate){
    // reference to router
    var appRouter;
    // cached views
    var cachedViews = {};
    // route to init with
    var renderExtention;

    // current corpus object
    var currentCorpus = new CorpusModel();

    // default view element path
    var defaultElement = '#contentTab';

    // currently rendered view
    var currentSubview;

    // renders new subview
    var applyNewSubview = function(subviewModel) {
        // render view
        var View = subviewModel.get('view');
        var newPath = subviewModel.get('path');
        if(cachedViews[newPath]) {
            currentSubview = cachedViews[newPath];
        } else {
            var view = new View({el: defaultElement, corpus: currentCorpus});
            cachedViews[newPath] = view;
            currentSubview = view;
        }
        currentSubview.render();
        // change topbar selection
        $('.viewExtention').each(function(index, item) {
            var $item = $(item);
            var path = $item.data('path');
            if(path === newPath) {
                $item.parent().addClass('active');
            } else {
                $item.parent().removeClass('active');
            }
        });
    };

    // register subview routes
    var initializeSubviews = function (extentions, initWithSubview) {
        // register routes
        extentions.forEach(function(extention) {
            var path = extention.get('path');
            var routePath = 'corpus/:id' + path;
            var routeName = 'ex' + extention.get('name');
            appRouter.route(routePath, routeName);

            // listen for event
            appRouter.on('route:'+routeName, function(){
                applyNewSubview(extention);
            });

            // check if we need to trigger the path
            if(initWithSubview && path === '/' + initWithSubview) {
                renderExtention = extention;
            }
        });
    };

    // handle rendering
    var handleRender = function(){
        // compile template
        var compiledTemplate = _.template(corpusTemplate, {extentions: this.collection.models});
        this.$el.html(compiledTemplate);

        // prepare first view
        var firstView = this.collection.at(0);
        // load corpus info
        $.get('/api/corpus/' + currentCorpus.get('_id'), function(data) {
            // update current model with new data
            currentCorpus = new CorpusModel(data);

            // render set view or navigate to first view
            if(renderExtention) {
                applyNewSubview(renderExtention);
            } else {
                // navigate to first view
                var link = firstView.get('path');
                var fullLink = 'corpus/' + currentCorpus.get('_id') + link;
                Backbone.history.navigate(fullLink, true);
            }
        });
    };

    // handle click on view extention link
    var handleViewExtention = function(e) {
        // prevent event
        e.preventDefault();

        // get current el
        var $el = $(e.target);
        // get link
        var link = $el.data('path');
        // form full link
        var fullLink = 'corpus/' + currentCorpus.get('_id') + link;
        // navigate
        Backbone.history.navigate(fullLink, true);
    };

    // view
    var CorpusView = Backbone.View.extend({
        el: $('#corpusContainer'),
        initialize: function(options) {
            // set router ref
            appRouter = options.router;
            // set collection of extentions subviews
            this.collection = corpusExtentionViewCollection;
            // and initialize them
            initializeSubviews(this.collection, options.extention);

            // store current corpus id
            currentCorpus.set('_id', options.corpusId);
        },
        render: handleRender,

        events: {
            'click .viewExtention': 'onViewExtention',
        },

        onViewExtention: handleViewExtention,
    });

    // Our module now returns our view
    return CorpusView;
});
