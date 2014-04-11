var gulp = require('./gulp')([
    'browserify',
    'watch',
    'serve',
    'minifycss',
    'bower',
    'bootstrap',
    'config',
    'jshint',
    'jasmine',
]);

gulp.task('init', ['bower', 'bootstrap', 'config']);
gulp.task('build', ['browserify', 'minifycss']);
gulp.task('test', ['jshint', 'jasmine']);
gulp.task('default', ['build', 'watch', 'serve']);