// includes
// config
var config = require('../../config');
// db
var User = require('../../db/user').User;
// passport
var passport = require('passport');
var passportGoogle = require('passport-google');

// define register function
var registerNewUser = function(profile, id, done) {
    var user = {
        username: profile.displayName,
        email: profile.emails[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        social_networks: [{
            network: 'google',
            id: id
        }]
    };

    // register
    User.registerNewUser(user, function(err, userData) {
        if(err) {
            return done(err);
        }

        return done(null, userData);
    });
};

// make passport policy
var GoogleStrategy = passportGoogle.Strategy;
passport.use(new GoogleStrategy(config.google,
    function (identifier, profile, done) {
        var username = profile.displayName;
        var glId = identifier.split('=')[1];
        var query = {
            username: username,
            'social_networks.network': 'google',
            'social_networks.id': glId
        };
        // try to find user
        User.findOne(query, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // register new user if none found
                return registerNewUser(profile, glId, done);
            }
            // if all is OK, return user
            return done(null, user);
        });
    }
));

// Redirect the user to Google for authentication.  When complete,
// Google will redirect the user back to the application at
//     /auth/google/callback
exports.google = {
    path: '/auth/google',
    method: 'get',
    returns: passport.authenticate('google')
};

// Google will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
exports.google_callback = {
    path: '/auth/google/callback',
    method: 'get',
    returns: passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    })
};
