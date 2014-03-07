// requires
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./db').db,
    corpusSchema, Corpus;

corpusSchema = new Schema({
    name: String,
    creation_date: {type: Date, default: Date.now},
    nlp_api: {type: String, default: 'DBpedia-Spotlight'},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    input: String,
    input_type: String,
    input_count: Number,
});

// Model
Corpus = mongoose.model('corpuses', corpusSchema);

// export
exports.Corpus = Corpus;
