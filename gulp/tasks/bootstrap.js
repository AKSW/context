var gulp = require('gulp');

module.exports = {
    deps: ['bower'],
    work: function() {
        return gulp.src('./bower_components/bootstrap/dist/fonts/**')
            .pipe(gulp.dest('./public/fonts/'));
    }
};