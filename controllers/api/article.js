var multiparty = require('multiparty');
// lodash
var _ = require('lodash');
// logger
var logger = require('../../logger');
// db
var ArticleDB = require('../../models').Article;

//functions
var getArticle = function (req, res, next) {
    var article = req.params.id;

    ArticleDB.findOne({_id: article}).exec(function (err, article) {
        if (err) {
            return next(err);
        }

        article = article.toObject();

        // send response
        return res.send(article);

    });
};
module.exports = function(app) {
    app.get('/api/article/:id', getArticle);

};

