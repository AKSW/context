// requires
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./db').db,
    corpusSchema, Corpus;

corpusSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    name: String,
    creation_date: {type: Date, default: Date.now},
    input_type: String,
    nlp_api: {type: String, default: 'DBpedia-Spotlight'},
    input: String,
});

// Model
Corpus = mongoose.model('corpuses', corpusSchema);

// export
exports.Corpus = Corpus;
