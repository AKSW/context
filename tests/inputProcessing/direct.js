// includes
var should = require('should');

// module being tested
var direct = require('../../modules/inputProcessing/direct');

// test data
var corpus = {
    _id: 'test',
    input: '\
The Himalayas, or Himalaya, (/ˌhɪməˈleɪ.ə/ or /hɪˈmɑːləjə/; Sanskrit, hima (snow) + ālaya (dwelling), literally, "abode of the snow"[1]) is a mountain range in Asia separating the plains of the Indian subcontinent from the Tibetan Plateau.\
The Himalayan range is home to the planet\'s highest peaks, including the highest, Mount Everest. The Himalayas include over a hundred mountains exceeding 7,200 metres (23,600 ft) in elevation. By contrast, the highest peak outside Asia – Aconcagua, in the Andes – is 6,961 metres (22,838 ft) tall.[2] The Himalayas have profoundly shaped the cultures of South Asia. Many Himalayan peaks are sacred in both Buddhism and Hinduism.\
Besides the Greater Himalayas of these high peaks there are parallel lower ranges. The first foothills, reaching about a thousand meters along the northern edge of the plains, are called the Sivalik Hills or Sub-Himalayan Range. Further north is a higher range reaching two to three thousand meters known as the Lower Himalayan or Mahabharat Range.\
The Himalayas abut or cross six countries: Bhutan, India, Nepal, China, Afghanistan and Pakistan, with the first three countries having sovereignty over most of the range.[3] The Himalayas are bordered on the northwest by the Karakoram and Hindu Kush ranges, on the north by the Tibetan Plateau, and on the south by the Indo-Gangetic Plain.',
};

describe('Direct input processing suit', function () {
    it('should get 1 results', function (done) {
        direct.process(corpus)
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
            });
            done();
        });
    });
});