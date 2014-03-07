// define config
requirejs.config({
    paths: {
        // require.js plugins
        'text' : '../bower_components/requirejs-text/text',

        // project dependencies
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap.min',
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
