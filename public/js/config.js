// define config
requirejs.config({
    paths: {
        // include require lib
        'requireLib': '../bower_components/requirejs/require',

        // require.js plugins
        'text' : '../bower_components/requirejs-text/text',

        // templating
        'doTCompiler': '../bower_components/doT/doT',
        'doT': '../bower_components/requirejs-doT/doT',

        // jquery and plugins
        'jquery': '../bower_components/jquery/dist/jquery',

        // bootstrap and plugins
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap',
        'bootstrap-slider': '../bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min',

        // backbone and deps
        'backbone': '../bower_components/backbone/backbone',
        'underscore': '../bower_components/underscore/underscore',
        'backbone.facetr': '../bower_components/Backbone.Facetr/dist/backbone.facetr',

        // stringjs
        'string': '../bower_components/stringjs/lib/string',
    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrap-slider': ['bootstrap'],
        'backbone': ['underscore'],
        'backbone.facetr': ['backbone'],
    },
    include: ['requireLib'],
});
