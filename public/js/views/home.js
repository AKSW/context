define([
    'underscore',
    'backbone',
], function(_, Backbone){
    // on corpus select event
    var corpusSelect = function(e) {
        // get new selection id
        var id = $(e.target).val();
        // redirect to corpus
        window.location = '/corpus/' + id;
    };

    // view
    var HomeView = Backbone.View.extend({
        el: $('body'),
        render: function(){
        },
        // handle events
        events: {
            'change #collection' : 'corpusSelect',
        },

        corpusSelect: corpusSelect,
    });

    // Our module now returns our view
    return HomeView;
});
