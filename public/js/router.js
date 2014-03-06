// Filename: router.js
define([
    'views/createCorpus',
], function(CreateCorpusView){
    var AppRouter = Backbone.Router.extend({
        routes: {
            // Define URL routes
            'createCorpus': 'showCreateCorpus',

            // Default
            '*actions': 'defaultAction'
        }
    });

    var initialize = function(){
        var appRouter = new AppRouter();
        appRouter.on('route:showCreateCorpus', function(){
            // Call render on the module we loaded in via the dependency array
            // 'views/projects/list'
            var createCorpusView = new CreateCorpusView();
            createCorpusView.render();
        });
        appRouter.on('route:defaultAction', function(actions){
            // We have no matching route, lets just log what the URL was
            console.log('No route:', actions);
        });
        Backbone.history.start({pushState: true});
    };

    return {
        initialize: initialize
    };
});
