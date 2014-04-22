// includes
var User = require('../../models').User;

// export index
exports.updateUser = {
    path: '/api/user/:id',
    method: 'post',
    returns: function(req, res, next){
        var id = req.params.id;
        if(req.user._id.toString() !== id) {
            return next(new Error('You cannot update someone else profile!'));
        }

        var user = {
            username: req.body.username,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
        };

        // check if username exists
        User.findOne({username: user.username}, function(err, exuser) {
            if (err) {
                return next(err);
            }

            if(exuser && exuser._id.toString() !== id) {
                req.flash('error', 'Username already taken!');
                return res.redirect('/profile');
            }

            User.update({_id: id}, user, function(err) {
                if(err) {
                    return next(err);
                }

                req.flash('success', 'Changes saved!');
                return res.redirect('/profile');
            });
        });
    }
};
