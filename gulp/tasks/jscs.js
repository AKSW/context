var gulp = require('gulp');
var jscs = require('gulp-jscs');

module.exports = function() {
    return gulp.src(['*.js', 'app/*.js', 'models/*.js', 'modules/**/*.js', 'controllers/**/*.js', 'public/js/**/*.js'])
        .pipe(jscs());
};
