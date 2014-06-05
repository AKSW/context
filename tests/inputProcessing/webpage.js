// includes
var should = require('should');

// module being tested
var webpage = require('../../modules/inputProcessing/webpage');

// test data
var corpus = {
    _id: 'test',
    input: 'http://www.rockpapershotgun.com/2014/04/11/garrys-mod-cheap/'
};

describe('Webpage input processing suit', function () {
    it('should get 1 results', function (done) {
        webpage.process(corpus)
        .then(function(res){
            // check length
            res.length.should.eql(1);
            // check fields
            res.forEach(function(item) {
                // check corpuses
                item.should.have.property('corpuses');
                item.corpuses.should.be.an.Array;
                item.corpuses.length.should.be.above(0);
                // check uri
                item.should.have.property('uri');
                item.uri.should.be.a.String;
                item.uri.length.should.be.above(0);
                // check source
                item.should.have.property('source');
                item.source.should.be.a.String;
                item.source.length.should.be.above(0);
                // check title
                item.should.have.property('title');
                item.title.should.be.a.String;
                item.title.length.should.be.above(0);
            });
            done();
        });
    });
});
