// includes
// config
var config = require('../../config');
// db
var User = require('../../models').User;
// passport
var passport = require('passport');
var passportLinkedin = require('passport-linkedin');

// define register function
var registerNewUser = function(profile, done) {
    var user = {
        username: profile.displayName,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        social_networks: [{
            network: 'linkedin',
            id: profile.id
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
var LinkedinStrategy = passportLinkedin.Strategy;
passport.use(new LinkedinStrategy(config.linkedin,
    function (token, tokenSecret, profile, done) {
        var username = profile.displayName;
        var lnId = profile.id;
        var query = {
            username: username,
            'social_networks.network': 'linkedin',
            'social_networks.id': lnId
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

// Redirect the user to Linkedin for authentication.  When complete,
// Linkedin will redirect the user back to the application at
//     /auth/linkedin/callback
exports.linkedin = {
    path: '/auth/linkedin',
    method: 'get',
    returns: passport.authenticate('linkedin')
};

// Linkedin will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
exports.linkedin_callback = {
    path: '/auth/linkedin/callback',
    method: 'get',
    returns: passport.authenticate('linkedin', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    })
};
