var gulp = require('gulp');
var rename = require('gulp-rename');

module.exports = function(){
    return gulp.src('./config.example.js')
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./'));
};