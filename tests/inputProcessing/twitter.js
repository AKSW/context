// includes
var should = require('should');

// module being tested
var twitter = require('../../modules/inputProcessing/twitter');

// test data
var username = 'yamalight';
var corpus = {
    _id: 'test',
    input: username,
    input_count: 200
};

describe('Twitter input processing suit', function () {
    it('should get 200 results', function (done) {
        twitter.process(corpus)
        .then(function(res){
            // check length
            res.length.should.eql(200);
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
        });
    });
});