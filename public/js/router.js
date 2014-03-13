// Filename: router.js
define([
    'underscore',
    'backbone',
    'views/home',
    'views/register',
    'views/profile',
    'views/createCorpus',
    'views/corpus',
], function(_, Backbone, HomeView, RegisterView, ProfileView, CreateCorpusView, CorpusView){
    var AppRouter = Backbone.Router.extend({
        routes: {
            // Define URL routes
            '': 'showHome',
            'profile': 'showProfile',
            'register': 'showRegistration',
            'createCorpus': 'showCreateCorpus',
            'corpus/:id': 'showCorpus',

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
        appRouter.on('route:showCorpus', function(id){
            var view = new CorpusView({id: id});
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
