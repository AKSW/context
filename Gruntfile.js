module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['*.js', 'controllers/**/*.js', 'public/js/**/*.js'],
            options: {
                // Settings
                'passfail': false, // Stop on first error.
                'maxerr': 10000, // Maximum error before stopping.

                // Predefined globals whom JSHint will ignore.
                'browser': true, // Standard browser globals e.g. `window`, `document`.
                'node': true, // node predefined stuff
                'jquery': true,
                'rhino': false,
                'couch': false,
                'wsh': false,
                'prototypejs': false,
                'mootools': false,
                'dojo': false,

                'predef': [ // Custom globals.
                    'define',
                    'module',
                    '__dirname',
                    'exports',
                    'process',
                    'alert',
                    'requirejs'
                ],

                // Development.
                'debug': true, // Allow debugger statements e.g. browser breakpoints.
                'devel': false, // Allow developments statements e.g. `console.log();`.

                // ECMAScript 5.
                'es5': false, // Allow ECMAScript 5 syntax.
                'strict': false, // Require `use strict` pragma  in every file.
                'globalstrict': false, // Allow global 'use strict' (also enables 'strict').

                // The Good Parts.
                'asi': false, // Tolerate Automatic Semicolon Insertion (no semicolons).
                'laxbreak': false, // Tolerate unsafe line breaks e.g. `return [\n] x` without semicolons.
                'bitwise': false, // Prohibit bitwise operators (&, |, ^, etc.).
                'boss': false, // Tolerate assignments inside if, for & while. Usually conditions & loops are for comparison, not assignments.
                'curly': true, // Require {} for every new block or scope.
                'eqeqeq': true, // Require triple equals i.e. `===`.
                'eqnull': false, // Tolerate use of `== null`.
                'evil': false, // Tolerate use of `eval`.
                'expr': false, // Tolerate `ExpressionStatement` as Programs.
                'forin': false, // Tolerate `for in` loops without `hasOwnPrototype`.
                'immed': true, // Require immediate invocations to be wrapped in parens e.g. `( function(){}() );`
                'latedef': true, // Prohibit variable use before definition.
                'loopfunc': false, // Allow functions to be defined within loops.
                'noarg': true, // Prohibit use of `arguments.caller` and `arguments.callee`.
                'regexp': true, // Prohibit `.` and `[^...]` in regular expressions.
                'regexdash': false, // Tolerate unescaped last dash i.e. `[-...]`.
                'scripturl': false, // Tolerate script-targeted URLs.
                'shadow': false, // Allows re-define variables later in code e.g. `var x=1; x=2;`.
                'supernew': false, // Tolerate `new function () { ... };` and `new Object;`.
                'undef': true, // Require all non-global variables be declared before they are used.
                'unused': false, // Warn about unused vars

                // Personal styling preferences.
                'newcap': true, // Require capitalization of all constructor functions e.g. `new F()`.
                'noempty': true, // Prohibit use of empty blocks.
                'nonew': true, // Prohibit use of constructors for side-effects.
                'nomen': false, // Prohibit use of initial or trailing underbars in names.
                'onevar': false, // Allow only one `var` statement per function.
                'plusplus': false, // Prohibit use of `++` & `--`.
                'sub': false, // Tolerate all forms of subscript notation besides dot notation e.g. `dict['key']` instead of `dict.key`.
                'trailing': true, // Prohibit trailing whitespaces.
                'white': false, // Check against strict whitespace and indentation rules.
                'indent': 4, // Specify indentation spacing
                'multistr': true, // allow multiline stirngs,
                'camelcase': false, // allow only camelCase vars
                'quotmark': true, // enforce quote consistency
                'maxdepth': 4 // allow max depth of functions 3
            }
        },

        // copy config
        copy: {
            init: {
                src: 'config.example.js',
                dest: 'config.js',
                filter: function(filepath) {
                    // only copy if config is not there
                    return !grunt.file.exists('./config.js');
                }
            },
        },

        // bower install
        bower: {
            init: {
                install: {}
            }
        },

        // shell stuff
        shell: {
            // build
            build: {
                command: 'cp -r public/bower_components/bootstrap/dist/fonts public/'
            }
        },

        // requirejs
        requirejs: {
            build: {
                options: {
                    baseUrl: 'public/js',
                    mainConfigFile: 'public/js/config.js',
                    name: 'app',
                    out: 'public/js/app.min.js'
                }
            }
        },

        // css compression
        cssmin: {
            build: {
                files: {
                    'public/css/main.min.css': [
                        'public/css/main.css',
                        'public/bower_components/bootstrap/dist/css/bootstrap.min.css'
                    ]
                }
            }
        }
    });

    // load extensions
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-shell');

    // define the tasks
    grunt.registerTask('init', 'Initializes app configs and libraries', ['copy', 'bower']);
    grunt.registerTask('build', 'Builds and minimizes stuff', ['shell:build', 'requirejs', 'cssmin']);
    grunt.registerTask('test', 'Runs tests', ['jshint']);

    // Default task(s).
    grunt.registerTask('default', ['test']);
};