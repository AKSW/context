var jsdom = require('jsdom');

exports.pageToJsdom = function(body, cb) {
    // parse
    jsdom.env({
        html: body,
        scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js'],
        done: function(errors, window) {
            if(errors !== null){
                console.log('jsdom error', errors);
                return cb();
            }

            // get jquery
            var $ = window.$;
            // return
            return cb($, window);
        },
    });
};
