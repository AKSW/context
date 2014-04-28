// includes
var should = require('should');

// module being tested
var twitter = require('../../modules/inputProcessing/twitter');

// test data for old profile
var username = 'Shagrost';
var corpus = {
    _id: 'test',
    input: username,
    input_count: 100
};

// test data for new profile
var usernameNew = 'yamalight';
var corpusNew = {
    _id: 'testNew',
    input: usernameNew,
    input_count: 100
};

var verifyResults = function(done, res){
    // check length
    res.length.should.eql(100);
    // check fields
    res.forEach(function(item) {
        // check corpuses
        item.should.have.property('corpuses');
        item.corpuses.should.be.an.Array;
        item.corpuses.length.should.be.above(0);
        // check creation_date
        item.should.have.property('creation_date');
        item.creation_date.should.be.instanceOf(Date);
        // check uri
        item.should.have.property('uri');
        item.uri.should.be.a.String;
        item.uri.length.should.be.above(0);
        // check source
        item.should.have.property('source');
        item.source.should.be.a.String;
        item.source.length.should.be.above(0);
    });
    done();
};

describe('Twitter input processing suit', function () {
    it('should get 100 results for old profile', function (done) {
        twitter.process(corpus)
        .then(verifyResults.bind(this, done));
    });

    it('should get 100 results for new profile', function (done) {
        twitter.process(corpusNew)
        .then(verifyResults.bind(this, done));
    });
});