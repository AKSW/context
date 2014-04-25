var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

module.exports = function(){
    return gulp.src(['*.js', 'app/*.js', 'models/*.js', 'modules/**/*.js', 'controllers/**/*.js', 'public/js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
};
