// requires
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./db').db,
    userSchema, User;

userSchema = new Schema({
    username: {type: String, unique: true},
    password: String,
    email: String,
    first_name: String,
    last_name: String,
    registration_date: {type: String, default: Date.now},
    social_networks: [{
        network: String,
        id: String
    }]
});

// Model
User = mongoose.model('users', userSchema);

// export
exports.User = User;
