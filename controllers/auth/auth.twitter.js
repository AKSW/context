// includes
// config
var config = require('../../config');
// db
var User = require('../../db/user').User;
// passport
var passport = require('passport');
var passportTwitter = require('passport-twitter');

// make passport policy
var TwitterStrategy = passportTwitter.Strategy;
passport.use(new TwitterStrategy(config.twitter,
    function (token, tokenSecret, profile, done) {
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

    // check username
    User.findOne({username: user.username}, function(err, exuser) {
        if(err) {
            return done(err);
        }

        // if username is taken, append random string
        if(exuser) {
            user.username += Date.now();
        }

        // save
        var userData = new User(user);
        userData.save(function(err) {
            if(err) {
                return done(err);
            }

            return done(null, userData);
        });
    });
};

// Redirect the user to Twitter for authentication.  When complete,
// Twitter will redirect the user back to the application at
//     /auth/twitter/callback
exports.twitter = {
    path: '/auth/twitter',
    method: 'get',
    returns: passport.authenticate('twitter')
};

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
exports.twitter_callback = {
    path: '/auth/twitter/callback',
    method: 'get',
    returns: passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    })
};
