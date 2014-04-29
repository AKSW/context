// includes
var should = require('should');

// module being tested
var files = require('../../modules/inputProcessing/files');

// get test data folder
var testFolder = __dirname + '/../data';

// test data
var corpus = {
    _id: 'test',
    files: [
        {
            name: 'upload_test1.txt',
            path: testFolder + '/upload_test1.txt'
        },
        {
            name: 'upload_test2.txt',
            path: testFolder + '/upload_test1.txt'
        },
        {
            name: 'upload_test3.txt',
            path: testFolder + '/upload_test1.txt'
        }
    ]
};

describe('Files input processing suit', function () {
    it('should get 3 results', function (done) {
        files.process(corpus)
        .then(function(res){
            // check length
            res.length.should.eql(3);
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
            });
            done();
        });
    });
});