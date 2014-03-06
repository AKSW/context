// Filename: router.js
define([
    'underscore',
    'backbone',
    'views/home',
    'views/register',
    'views/profile',
    'views/createCorpus',
], function(_, Backbone, HomeView, RegisterView, ProfileView, CreateCorpusView){
    var AppRouter = Backbone.Router.extend({
        routes: {
            // Define URL routes
            '': 'showHome',
            'profile': 'showProfile',
            'register': 'showRegistration',
            'createCorpus': 'showCreateCorpus',

            // Default
            '*actions': 'defaultAction'
        }
    });

    var initialize = function(){
        var appRouter = new AppRouter();
        appRouter.on('route:showHome', function(){
            var view = new HomeView();
            view.render();
        });
        appRouter.on('route:showProfile', function(){
            var view = new ProfileView();
            view.render();
        });
        appRouter.on('route:showRegistration', function(){
            var view = new RegisterView();
            view.render();
        });
        appRouter.on('route:showCreateCorpus', function(){
            var view = new CreateCorpusView();
            view.render();
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
