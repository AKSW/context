var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

module.exports = function() {
    var bundler = browserify().add('./public/js/app.js');

    // uglifify
    bundler.transform({mangle: false}, 'uglifyify');

    return bundler.bundle()
        // Pass desired output filename to vinyl-source-stream
        .pipe(source('app.min.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./public/dist/'));
};
