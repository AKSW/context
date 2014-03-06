define([
    'underscore',
    'backbone',
], function(_, Backbone){
    var RegisterView = Backbone.View.extend({
        el: $('body'),
        render: function(){
        },
    });

    // Our module now returns our view
    return RegisterView;
});
