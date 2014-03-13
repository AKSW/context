define([
    'underscore',
    'backbone',
], function(_, Backbone){
    // view
    var CorpusView = Backbone.View.extend({
        el: $('body'),
        render: function(){
            console.log('corpus view');
        },
    });

    // Our module now returns our view
    return CorpusView;
});
