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
    'jscs',
    'vendor',
]);

gulp.task('init', ['bower', 'bootstrap', 'config']);
gulp.task('build', ['browserify', 'vendor', 'minifycss']);
gulp.task('test', ['jshint', 'mocha', 'jscs']);
gulp.task('default', ['build', 'watch', 'serve']);
