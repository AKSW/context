// requires
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User;

var userSchema = new Schema({
    username: {type: String, unique: true},
    password: String,
    email: String,
    first_name: String,
    last_name: String,
    registration_date: {type: Date, default: Date.now},
    social_networks: [{
        network: String,
        id: String
    }]
});

// custom registration method with additional checks
userSchema.statics.registerNewUser = function (user, cb) {
    // check username
    this.findOne({username: user.username}, function(err, exuser) {
        if(err) {
            return cb(err, null);
        }

        // if username is taken, append random string
        if(exuser) {
            user.username += Date.now();
        }

        // save
        var userData = new User(user);
        userData.save(function(err) {
            if(err) {
                return cb(err, null);
            }

            return cb(null, userData);
        });
    });
};

// Model
User = mongoose.model('users', userSchema);

// export
module.exports = User;
