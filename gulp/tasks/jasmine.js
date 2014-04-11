var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

module.exports = function(){
    gulp.src('./tests/**/*').pipe(jasmine({
        reporter: '',
        verbose: true,
    }));
};
