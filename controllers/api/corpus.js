// includes
var Corpus = require('../../modules/corpus');

// export index
exports.createCorpus = {
    path: '/api/corpus',
    method: 'post',
    returns: function(req, res, next){
        // get data
        var corpus = req.body.corpus;
        var inputCount = req.body.inputCount;

        // trigger creation
        Corpus.createCorpus(corpus, inputCount);

        res.send('OK');
    }
};
