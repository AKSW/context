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
]);

gulp.task('init', ['bower', 'bootstrap', 'config']);
gulp.task('build', ['browserify', 'minifycss']);
gulp.task('test', ['jshint', 'mocha']);
gulp.task('default', ['build', 'watch', 'serve']);