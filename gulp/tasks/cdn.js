var gulp = require('gulp');
var rename = require('gulp-rename');
var cdnizer = require('gulp-cdnizer');

module.exports = {
    deps: ['inject'],
    work: function() {
        return gulp.src('views/core/layout.dust')
            .pipe(cdnizer({
                files: [{
                    file: '/bower_components/angular/angular.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.15/angular.min.js'
                },
                {
                    file: '/bower_components/jquery/dist/jquery.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js'
                },
                {
                    file: '/bower_components/angular-route/angular-route.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.15/angular-route.min.js'
                },
                {
                    file: '/bower_components/bootstrap/dist/js/bootstrap.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min.js'
                },
                /*{
                    file: '/bower_components/angular-strap/dist/angular-strap.min.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/angular-strap/2.0.0/angular-strap.min.js'
                },
                {
                    file: '/bower_components/angular-strap/dist/angular-strap.tpl.min.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/angular-strap/2.0.0/angular-strap.tpl.min.js'
                },*/
                {
                    file: '/bower_components/angular-ui-router/release/angular-ui-router.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.8/angular-ui-router.min.js'
                },
                {
                    file: '/bower_components/lodash/dist/lodash.compat.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js'
                },
                {
                    file: '/bower_components/stringjs/lib/string.min.js',
                    cdn: '//cdnjs.cloudflare.com/ajax/libs/string.js/1.8.0/string.min.js'
                }]
            }))
            .pipe(rename('layout.cdn.dust'))
            .pipe(gulp.dest('views/core/'));
    }
};
