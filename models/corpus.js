// requires
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var corpusSchema = new Schema({
    name: String,
    creation_date: {type: Date, default: Date.now},
    nlp_api: {type: String, default: 'DBpedia-Spotlight'},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    input: String,
    input_type: String,
    input_count: Number,
    files: [{
        name: String,
        path: String,
    }]
});

// Model
var Corpus = mongoose.model('corpuses', corpusSchema);

// export
module.exports = Corpus;
