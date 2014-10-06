// includes
var should = require('should');

// module being tested
var dbpedia = require('../../modules/annotationServices/dbpedia');

// test data
var testData = '\
The Himalayas, or Himalaya, (/ˌhɪməˈleɪ.ə/ or /hɪˈmɑːləjə/; Sanskrit, hima (snow) + ālaya (dwelling), literally, "abode of the snow"[1]) is a mountain range in Asia separating the plains of the Indian subcontinent from the Tibetan Plateau.\
The Himalayan range is home to the planet\'s highest peaks, including the highest, Mount Everest. The Himalayas include over a hundred mountains exceeding 7,200 metres (23,600 ft) in elevation. By contrast, the highest peak outside Asia – Aconcagua, in the Andes – is 6,961 metres (22,838 ft) tall.[2] The Himalayas have profoundly shaped the cultures of South Asia. Many Himalayan peaks are sacred in both Buddhism and Hinduism.\
Besides the Greater Himalayas of these high peaks there are parallel lower ranges. The first foothills, reaching about a thousand meters along the northern edge of the plains, are called the Sivalik Hills or Sub-Himalayan Range. Further north is a higher range reaching two to three thousand meters known as the Lower Himalayan or Mahabharat Range.\
The Himalayas abut or cross six countries: Bhutan, India, Nepal, China, Afghanistan and Pakistan, with the first three countries having sovereignty over most of the range.[3] The Himalayas are bordered on the northwest by the Karakoram and Hindu Kush ranges, on the north by the Tibetan Plateau, and on the south by the Indo-Gangetic Plain.';

describe('DBPedia annotation suit', function () {
    it('should get at least 29 entities', function (done) {
        dbpedia.process(testData)
        .then(function(res) {
            // check properties
            res.should.have.property('annotation');
            res.should.have.property('entities');
            // check entity count
            res.entities.should.be.an.Array;
            res.entities.length.should.be.above(29);
            // check entity format
            res.entities.forEach(function(item) {
                // check typs property
                item.should.have.property('types');
                item.types.should.be.an.Array;
                // check types values
                item.types.forEach(function(type) {
                    type.should.be.a.String;
                });
                // check name property
                item.should.have.property('name');
                item.name.should.be.a.String;
                // check uri property
                item.should.have.property('uri');
                item.uri.should.be.a.String;
                // check offset property
                item.should.have.property('offset');
                item.offset.should.be.a.Number;
                // check precision property
                item.should.have.property('precision');
                item.precision.should.be.a.Number;
                item.precision.should.be.within(0, 1);
            });
            done();
        });
    });
});
