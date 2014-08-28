// includes
// config
var config = require('../../config');
// db
var User = require('../../models').User;
// passport
var passport = require('passport');
var passportLocal = require('passport-local');
// crypto
var crypto = require('crypto');

// make passport policy
var LocalStrategy = passportLocal.Strategy;
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }

            // encode password
            var md5sum = crypto.createHash('md5');
            md5sum.update(password + config.passwordSalt);
            var passHex = md5sum.digest('hex');

            // chek password
            if (passHex !== user.password) {
                return done(null, false);
            }
            // if all is OK, return user
            return done(null, user);
        });
    }
));

module.exports = function(app) {

    // export index
    app.post('/auth/register', function(req, res, next) {
        // check password for match
        if (req.body.password_new !== req.body.password_repeat) {
            req.flash('error', 'Passwords do not match!');
            req.flash('oldData', req.body);
            return res.redirect('/register');
        }

        // check captcha
        if (parseInt(req.body.captcha) !== req.session.captcha) {
            req.flash('error', 'Wrong captcha input!');
            req.flash('oldData', req.body);
            return res.redirect('/register');
        }

        // encode password
        var md5sum = crypto.createHash('md5');
        md5sum.update(req.body.password_new + config.passwordSalt);
        var passHex = md5sum.digest('hex');

        // make new user data
        var newUser = {
            username: req.body.username,
            password: passHex,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
        };

        // check if user exists
        User.findOne({
            username: newUser.username
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                req.flash('error', 'User already exists!');
                req.flash('oldData', req.body);
                return res.redirect('/register');
            } else {
                // create new user
                var userModel = new User(newUser);
                userModel.save(function(err) {
                    if (err) {
                        return next(err);
                    } else {
                        // if all is OK, redirect to root
                        return res.redirect('/');
                    }
                });
            }
        });
    });

    app.post('/auth/login', function(req, res, next) {
        passport.authenticate('local', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('error', 'Incorrect login or password!');
                req.flash('oldusername', req.body.username);
                return res.redirect('/');
            }
            req.login(user, function(err) {
                if (err) {
                    return next(err);
                }
                // redirect to the user profile on success
                return res.redirect('/');
            });
        })(req, res, next);
    });
};
