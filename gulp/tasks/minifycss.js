var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var config = require('../../config');

module.exports = function() {
    gulp.src([
        './public/css/*.css',
        'public/bower_components/bootstrap/dist/css/bootstrap.min.css'
    ])
    .pipe(minifyCSS({
        debug: config.debug,
    }))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('./public/dist/'))
    .pipe(livereload());
};
