define([
    'underscore',
    'backbone',
], function(_, Backbone){
    var ProfileView = Backbone.View.extend({
        el: $('body'),
        render: function(){
        },
    });

    // Our module now returns our view
    return ProfileView;
});
