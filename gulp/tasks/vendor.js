var fs = require('fs');
// only do work if config already exists
if (fs.existsSync('../../config.js')) {
    var gulp = require('gulp');
    var config = require('../../config');
    var mainBowerFiles = require('main-bower-files');
    var concat = require('gulp-concat');
    var gulpif = require('gulp-if');
    var uglify = require('gulp-uglify');

    module.exports = function() {
        return gulp.src(mainBowerFiles({
            paths: {
                bowerDirectory: './bower_components',
                bowerJson: './bower.json'
            },
            filter: /\.js$/,
        }))
        .pipe(concat('vendor.min.js'))
        .pipe(gulpif(!config.debug, uglify()))
        .pipe(gulp.dest('./public/dist/'));
    };
} else {
    module.exports = function() {
    };
}
