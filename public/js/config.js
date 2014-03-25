// define config
requirejs.config({
    paths: {
        // require.js plugins
        'text' : '../bower_components/requirejs-text/text',

        // templating
        'doTCompiler': '../bower_components/doT/doT',
        'doT': '../bower_components/requirejs-doT/doT',

        // project dependencies
        'jquery': '../bower_components/jquery/dist/jquery',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap',
        'underscore': '../bower_components/underscore/underscore',
        'backbone': '../bower_components/backbone/backbone',
        'bootstrap-slider': '../bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
        'requireLib': '../bower_components/requirejs/require',
    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrap-slider': ['bootstrap'],
        'backbone': ['underscore'],
    },
    include: ['requireLib'],
});
