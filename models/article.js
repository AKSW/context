// requires
// var cheerio = require('cheerio');
// promise
var Promise = require('bluebird');

// db requires
var mongoose = require('mongoose');
var mongolastic = require('mongolastic');

var Schema = mongoose.Schema;
var Article;

var articleSchema = new Schema({  //TODO: optimize es mapping
    uri: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        default: ''
    },
    source: String,
    annotation: String,
    creation_date: {
        type: Date,
        default: Date.now
    },
    corpuses: [{
        type: Schema.Types.ObjectId,
        ref: 'corpuses',
        elastic: {popfields: '_id'}    //TODO: map only corpus ids
    }],
    processed: {
        type: Boolean,
        default: false
    },

    // array of entities for annotation
    entities: [{
        name: String,
        types: [String],
        uri: String,
        offset: Number,
        precision: Number
    }]
});

// custom create method with additional checks
articleSchema.statics.createNew = function(article) {
    var self = this;
    return new Promise(function(resolve, reject) {
        // check username
        self.findOne({
            uri: article.uri
        }, function(err, exarticle) {
            if (err) {
                return reject(err);
            }

            // if article already exists, just append it to new corpus
            if (exarticle) {
                exarticle.update({
                    $push: {
                        corpuses: article.corpuses[0]
                    }
                }, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(exarticle);
                });
                return;
            }

            // save article if none found
            var doc = new Article(article);
            doc.save(function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            });
        });
    });
};


//add mongolastic plugin into mongoose
articleSchema.plugin(mongolastic.plugin,{modelname: 'articles'});

// Model
Article = mongoose.model('articles', articleSchema);

//sync mongodb entries with elasticsearch index,
//TODO: set a parameter in config.js for auto-sync. currently, sync is deactivated
/*Article.sync(function(err,numSynced){
    console.log('elasticsearch: ' + numSynced + ' article(s) synced');
})*/

// export
module.exports = Article;
