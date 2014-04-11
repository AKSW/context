// includes
var should = require('should');

// module being tested
var feed = require('../../modules/inputProcessing/feed');

// test data
var url = 'http://www.rockpapershotgun.com/feed/';
var corpus = {
    _id: 'test',
    input: url,
    input_count: 12
};

describe('Feed input processing suit', function () {
    it('should get 50 results', function (done) {
        feed.process(corpus)
        .then(function(res){
            // check length
            res.length.should.eql(12);
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