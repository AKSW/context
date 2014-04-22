// export index
exports.corpusView = {
    path: '/corpus/:id',
    method: 'get',
    returns: function(req, res) {
        return res.render('corpus');
    }
};

exports.corpusViewWithExtention = {
    path: '/corpus/:id/*',
    method: 'get',
    returns: function(req, res) {
        return res.render('corpus');
    }
};
