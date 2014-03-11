// db
var Corpus = require('../../db/corpus').Corpus;

// export index
exports.index = {
    path: '/',
    method: 'get',
    returns: function(req, res, next) {
        if(req.user) {
            Corpus.find({user: req.user._id}, function(err, corpuses) {
                if(err) {
                    console.log('error getting user corpuses', err);
                    return next(err);
                }

                // form data
                var data = {
                    error: req.flash('error'),
                    oldusername: req.flash('oldusername'),
                    corpuses: corpuses,
                };
                return res.render('index', data);
            });
        } else {
            var data = {
                error: req.flash('error'),
                oldusername: req.flash('oldusername'),
            };
            return res.render('index', data);
        }
    }
};


// export profile
exports.profile = {
    path: '/profile',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('profile', {error: req.flash('error'), success: req.flash('success')});
    }
};

// export createCorpus
exports.createCorpus = {
    path: '/createCorpus',
    method: 'get',
    returns: function(req, res, next) {
        return res.render('createCorpus');
    }
};
