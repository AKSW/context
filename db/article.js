// requires
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./db').db,
    articleSchema, Article;

articleSchema = new Schema({
    uri: {type: String, unique: true},
    source: String,
    annotation: String,
    creation_date: {type: Date, default: Date.now},
    corpuses: [{type: Schema.Types.ObjectId, ref: 'corpuses'}],
    processed: {type: Boolean, default: false},

    // array of entities for annotation
    entities: [{
        name: String,
        types: [String],
        uri: String,
        offset: Number,
        precision: Number,
    }],
});

// custom create method with additional checks
articleSchema.statics.createNew = function (article, cb) {
    // check username
    this.findOne({uri: article.uri}, function(err, exarticle) {
        if(err) {
            return cb(err, null);
        }

        // if article already exists, just append it to new corpus
        if(exarticle) {
            exarticle.update({'$push': {corpuses: article.corpuses[0]}}, function(err){
                if(err) {
                    return cb(err, null);
                }
                return cb(null, exarticle);
            });
            return;
        }

        // save article if none found
        var doc = new Article(article);
        doc.save(function(err) {
            if(err) {
                return cb(err, null);
            }
            return cb(null, doc);
        });
    });
};

// Model
Article = mongoose.model('articles', articleSchema);

// export
exports.Article = Article;
