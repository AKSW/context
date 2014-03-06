// load common libraries
define([
    'bootstrap',
    'backbone',
    'router',
    'bootstrap-slider',
], function(
    Bootstrap,
    Backbone,
    Router,
    _slider
) {
    // define app
    var App = function(){
        this.initialize = function () {
            // initialize router
            Router.initialize();
        };

        return this;
    };

    return new App();
});
