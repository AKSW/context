// includes
// config
var config = require('../../config');
// db
var User = require('../../models').User;
// passport
var passport = require('passport');
var passportFacebook = require('passport-facebook');

// define register function
var registerNewUser = function(profile, done) {
    var user = {
        username: profile.username,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        social_networks: [{
            network: 'facebook',
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
var FacebookStrategy = passportFacebook.Strategy;
passport.use(new FacebookStrategy(config.facebook,
    function(accessToken, refreshToken, profile, done) {
        var username = profile.username;
        var fbId = profile.id;
        var query = {
            username: username,
            'social_networks.network': 'facebook',
            'social_networks.id': fbId
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
    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get('/auth/facebook', passport.authenticate('facebook'));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
};
