var gulp = require('./gulp')([
    'browserify',
    'watch',
    'serve',
    'minifycss',
    'bower',
    'bootstrap',
    'config',
    'jshint',
    'mocha',
    'inject',
    'cdn',
]);

gulp.task('init', ['bower', 'bootstrap', 'config']);
gulp.task('build', ['browserify', 'inject', 'minifycss', 'cdn']);
gulp.task('test', ['jshint', 'mocha']);
gulp.task('default', ['build', 'watch', 'serve']);