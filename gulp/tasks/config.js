var gulp = require('gulp');
var rename = require('gulp-rename');
var exit = require('gulp-exit');

module.exports = {
    deps: ['bootstrap'],
    work: function() {
        return gulp.src('./config.example.js')
            .pipe(rename('config.js'))
            .pipe(gulp.dest('./'))
            .pipe(exit());
    }
};