var gulp = require('gulp');

module.exports = function(){
    gulp.src('./public/bower_components/bootstrap/dist/fonts/**')
    .pipe(gulp.dest('./public/fonts/'));
};