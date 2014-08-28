// includes
// config
var config = require('../../config');
// db
var User = require('../../models').User;
// passport
var passport = require('passport');
var passportTwitter = require('passport-twitter');

// define register function
var registerNewUser = function(profile, done) {
    var user = {
        username: profile.username,
        first_name: profile.displayName,
        last_name: '',
        social_networks: [{
            network: 'twitter',
            id: profile.id
        }]
    };

    // register
    User.registerNewUser(user, function(err, userData) {
        if (err) {
            return done(err);
        }

        return done(null, userData);
    });
};

// make passport policy
var TwitterStrategy = passportTwitter.Strategy;
passport.use(new TwitterStrategy(config.twitter,
    function(token, tokenSecret, profile, done) {
        var username = profile.username;
        var twId = profile.id;
        var query = {
            username: username,
            'social_networks.network': 'twitter',
            'social_networks.id': twId
        };
        // try to find user
        User.findOne(query, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // register new user if none found
                return registerNewUser(profile, done);
            }
            // if all is OK, return user
            return done(null, user);
        });
    }
));

module.exports = function(app) {
    // Redirect the user to Twitter for authentication.  When complete,
    // Twitter will redirect the user back to the application at
    //     /auth/twitter/callback
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // Twitter will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
};
