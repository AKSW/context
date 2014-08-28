var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');

module.exports = function() {
    var config = require('../../config');

    return gulp.src([
        './public/css/*.css',
        './bower_components/bootstrap/dist/css/bootstrap.min.css',
        './bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.min.css',
        './bower_components/angular-motion/dist/angular-motion.min.css',
    ])
    .pipe(minifyCSS({
        debug: config.debug,
    }))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('./public/dist/'));
};
