// db
var logger = require('../../logger');
var ArticleDB = require('../../models').Article;
var CorpusDB = require('../../models').Corpus;
var UserDB = require('../../models').User;
var rdfstore = require("rdfstore");
var config = require('../../config');
var baseUri = config.rdfbackend.baseuri;
var nifcreator = require ("../../modules/nif.js");
var nifprefix = nifcreator.nifprefix;
var mongodb = require("mongodb");
var async = require('async');
var asyncawait = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');

var CorpusesArray= []; //Array of all CorpusObjects
var UsersArray =[]; // Array of all UserObjects


var initialise = asyncawait(function () {
    return new Promise(function (resolve, reject) {
        CorpusesArray = await(getAllCorpuses());
        UsersArray = await(getAllUsers());
        resolve (true);
    });
});

var saveAllArticleAsRDF = asyncawait(function (req, res, next) {
    var requestId = req.params.id;
    await(initialise());
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }

    var articles = await(getAllArticle());
    var nifString = nifprefix;
    articles.forEach(function (article) {
        nifString = nifString + articleProcessor(article);
    });

    sendTTL(req, res, nifString);
});


/*function saveArticleAsRDF(req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }

    ArticleDB.findOne({_id: req.params.id}).exec(function (err, article) {
        if (err) {
            return next(err);
        }

        //Check if there are any article
        if ((article === null) || (article == "undefined")){
            res.send("No Article found");
            return next;
        }

        article = article.toObject();

        var nifString = nifprefix;
        nifString = nifString + articleProcessor(article);
        sendTTL(req, res, nifString);
    });

}*/
var saveArticleAsRDF = asyncawait(function (req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    await(initialise());
    var article = await(getArticle(requestId));
    //Check if there are any article
    if ((article === null) || (article == "undefined")){
        res.send("No Article found");
        return next;
    }

    article = article.toObject();
    var nifString = nifprefix;
    nifString = nifString + articleProcessor(article);
    sendTTL(req, res, nifString);

});

var saveCorpusAsRDF= asyncawait(function (req, res, next) {
    var requestId = req.params.id;
    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    await(initialise());
    var articles = await(getCorpus(requestId).then(getCorpusArticles));
    var nifString = nifprefix;
    articles.forEach(function (article) {
        nifString = nifString + articleProcessor(article);
    });
    sendTTL(req, res, nifString);
});

var saveUserArticlesAsRDF = asyncawait(function (req, res, next) {
    var requestId = req.params.id;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    await(initialise());
    var corpuses = await(getUser(requestId).then(getUserCorpuses));

    var articles;
    var nifString = nifprefix;


    for (var i=0;i<corpuses.length; i++){
        articles = await(getCorpusArticles(corpuses[i]));
        for (var j in articles) {
            nifString = nifString + articleProcessor(articles[j]);
        }

    }
    sendTTL(req, res, nifString);
});

function articleProcessor(articleobject) {
    if ((articleobject == null)||(articleobject == "undefined")) {
        return false;
    }

    articleobject = addCorpusObjectToArticle(articleobject);
    articleobject = addUserObjectToArticleCorpus(articleobject);

    var nifarticle;
    nifarticle = nifcreator.articleTonif(articleobject);

    if ((nifarticle) && (nifarticle != "undefined")){
        if(config.rdfbackend.nifsave === true )save2rdfstore(nifarticle, articleobject._id);
        return nifarticle;
    }
    else {
        return false;
    }
}


function save2rdfstore(ttlString, articleID) {
    rdfstore.create(config.rdfbackendSettings, function (store) {
        var graphuri = baseUri + "/article/" + articleID;

        //delete article Graph if exist
        store.clear(graphuri, function (success) {
            if (!success) {
                logger.info("Error cleaning the graph URI for graph: " + graphuri);
            }

            store.load("text/turtle", nifprefix + ttlString, graphuri, function (success, results) {
                if (!success) {
                    logger.info("Error saving the graphuri" + graphuri + " Error: " + results);
                }

            });
        });
        //@TODO Observe how well deletition works. rdfjs didn't always del all graphs then add a lowlevel delete option


    });
}

//Creates a new instance of rdfstore with option overwrite = true. Which drops the whole Collection
function delAllArticleAsRDF(req, res, next) {

    var overwriteconf = config.rdfbackendSettings;
    overwriteconf.overwrite = true;
    rdfstore.create(overwriteconf, function (store){
        res.send("Delete succesfully");
    });
}

var delCorpusAsRDF = asyncawait(function (req, res, next){
    var requestId = req.params.id;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    var articles = await(getCorpusArticles(requestId));
    delArticles(articles);

    res.send("Article  Deleting startet");
});

function delUserArticlesAsRDF(req, res, next){
    var requestId = req.params.id;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }
    UserDB.findOne({_id: requestId}).exec(function (err, user) {
        if (err) {
            return next(new Error('Something gone wrong by finding User'+err));
        }
        if ((user === "undefined")|| ( user === null) || (user.length === 0)) {
            res.send(" User not found");
            return next();
        }
        CorpusDB.find({user: user._id}).exec(function (err, userCorpuses) {
            if (!userCorpuses || userCorpuses.length === 0 || userCorpuses === null) {
                res.send(" There are no Corpus for this user");
                return next();
            }

            for (var i in userCorpuses) {
                //get all article for corpus i
                article = ArticleDB.find({corpuses: userCorpuses[i]._id}).exec(function (err, article) {
                    //del all articles
                    delArticles(article);
                });
            }

        });

    });
    res.send("Deleteprocess startet");

}

function delArticle(req, res, next) {
    var requestId = req.params.id;
    var graphuri = baseUri + "/article/" + requestId;

    if(!isValidMongodbID(requestId)){
        res.send("Not a valid ID");
        return next(new Error('Not a valid MongoDB ID! ID:'+requestId));
    }

    //TODO add some form of verification
    //TODO better create a new instance of rdfstore with overwrite option

    rdfstore.create(config.rdfbackendSettings, function (store) {
        store.clear(graphuri, function (success) {
            if(!success){
                logger.info("Deleting article"+ requestId +" from RDF backend failed");
                res.send("Deleting article from RDF backend failed");
            }
            else{
                res.send("Successfully deleted graph "+ graphuri);
            }
        });


    });
}

function delArticles(articleArray) {

    var graphuri = baseUri + "/article/";
    var articleIndex = 0;

    rdfstore.create(config.rdfbackendSettings, function (store) {
        async.whilst(function () {
                return articleIndex < articleArray.length;
            },
            function (next) {
                store.clear(graphuri + articleArray[articleIndex]._id, function (success) {
                    if (success) {
                        articleIndex++;
                        next();
                    }
                });
            },
            function (err) {
                // All things are done!
                if (err) logger.info("Error! + " + err);
            });
    });
}

var getUser =function(id){

    return new Promise(function (resolve, reject) {
        //if(!isValidMongodbID(id)) reject(new Error('invalid MongoDB ID: '+id));
        UserDB.findOne({_id: id}).exec(function (err, user) {

            if (err) {
                reject(new Error('Something gone wrong by finding User'+err));
            }
            else if ((user === "undefined")|| ( user === null) || (user.length === 0)) {
                reject(new Error('User not found'));
            }
            else{
                resolve(user);
            }
        });
    });
}

var getAllUsers =function(){
    return new Promise(function (resolve, reject) {
        UserDB.find().exec(function (err, users) {
            if (err) {
                reject(new Error('Something gone wrong by finding User'+err));
            }
            else if ((users === "undefined")|| ( users === null) || (users.length === 0)) {
                reject(new Error('User not found'));
            }
            else{
                //UsersArray = users;
                resolve(users);
            }
        });
    });
}

function getCorpus(id){

    return new Promise(function (resolve, reject) {
        if(!isValidMongodbID(id)) reject(new Error('invalid MongoDB ID: '+id));

        CorpusDB.findOne({_id: id}).exec(function (err, corpus) {
            if (err) {
                reject(new Error('Something gone wrong by finding User'+err));
            }
            else if ((corpus === "undefined")|| ( corpus === null) || (corpus.length === 0)) {
                reject(new Error('Corpus not Found'));
            }
            else{
                resolve(corpus);
            }
        });
    });
}

function getUserCorpuses(user){
    var userid;

    if (typeof user == "string") userid = user;
    else {
        userid = user._id;
    }
    return new Promise(function (resolve, reject) {

        CorpusDB.find({user: userid}).exec(function (err, userCorpuses) {
            if (err) {
                reject(new Error('Something gone wrong by finding User Corpuses'+err));
            }
            else if ((userCorpuses === "undefined")|| ( userCorpuses === null) || (userCorpuses.length === 0)) {
                reject(new Error('Corpus not Found'));
            }
            else{
                resolve(userCorpuses);
            }
        });
    });
}

function getAllCorpuses(){
    return new Promise(function (resolve, reject) {

        CorpusDB.find().exec(function (err, corpus) {
            if (err) {
                reject(new Error('Something gone wrong by finding User'+err));
            }
            else if ((corpus === "undefined")|| ( corpus === null) || (corpus.length === 0)) {
                reject(new Error('Corpus not Found'));
            }
            else{
                //CorpusesArray = corpus;
                resolve(corpus);
            }
        });
    });
}

function getCorpusArticles(corpus){
    var corpusId;
    if (typeof corpus == "string") corpusId = corpus;
    else {
        corpusId = corpus._id;
    }

    return new Promise(function (resolve, reject) {

        ArticleDB.find({corpuses: corpusId}).exec(function (err, articles) {
            if (err) {
                reject(new Error('Something gone wrong by finding User Corpuses'+err));
            }
            else if ((articles === "undefined")|| ( articles === null) || (articles.length === 0)) {
                reject(new Error('Corpus not Found'));
            }
            else{
                resolve(articles);
            }
        });
    });
}

function getArticle(id){
    return new Promise(function (resolve, reject) {
        if(!isValidMongodbID(id)) reject(new Error('invalid MongoDB ID: '+id));

        ArticleDB.findOne({_id: id}).exec(function (err, article) {
            if (err) {
                reject(new Error('Something gone wrong by finding Article'+err));
            }
            else if ((article === "undefined")|| ( article === null) || (article.length === 0)) {
                reject(new Error('Article not Found'));
            }
            else{
                resolve(article);
            }
        });
    });
}

function getAllArticle(){
    return new Promise(function (resolve, reject) {
        ArticleDB.find().exec(function (err, articles) {
            if (err) {
                reject(new Error('Something gone wrong by finding Article'+err));
            }
            else if ((articles === "undefined")|| ( articles === null) || (articles.length === 0)) {
                reject(new Error('Article not Found'));
            }
            else{
                resolve(articles);
            }
        });
    });
}

function addCorpusObjectToArticle(articleObject){
    var CorpusObjects =[];

    for (var j=0; j<articleObject.corpuses.length;j++){
        for (var i=0; i<CorpusesArray.length; i++){
            if (CorpusesArray[i]._id.id == articleObject.corpuses[j].id){
                CorpusObjects.push(CorpusesArray[i]);
                break;
            }
        }
    }
    articleObject.corpusObject = CorpusObjects;

    return articleObject;
}

function addUserObjectToArticleCorpus(articleObject){
    for (var i=0; i<articleObject.corpusObject.length; i++){
        for (var j=0; j<UsersArray.length; j++){

            if (UsersArray[j]._id.id == articleObject.corpusObject[i].user.id) {
                articleObject.corpusObject[i].userObject = UsersArray[j];}
        }
    }
    return articleObject;
}

function isValidMongodbID(id){
    return mongodb.ObjectID.isValid(id);
}


function sendTTL(req, res, data){
    res.setHeader("Content-Type", "text/turtle; charset=UTF-8");
    res.setHeader("Content-Transfer-Encoding: binary"); // to preserve linebreaks (\n instead of \r\n)
    if ((req.params.id == null) || (req.params.id ==="undefined")) req.params.id = "context";
    res.attachment(req.params.id+'.ttl'); //Sets the Content-Disposition header field to requestId.ttl
    res.send(data);
}
module.exports = function (app) {

    if (config.rdfbackend.nifexport) { //check if NIF Export is enabled

        app.get('/api/nif/saveall', saveAllArticleAsRDF);
        app.get('/api/nif/deleteall', delAllArticleAsRDF);

        app.get('/api/nif/article/:id', saveArticleAsRDF);
        app.get('/api/nif/article/del/:id', delArticle);

        app.get('/api/nif/corpus/:id', saveCorpusAsRDF);
        app.get('/api/nif/corpus/del/:id', delCorpusAsRDF);

        app.get('/api/nif/user/:id', saveUserArticlesAsRDF);
        app.get('/api/nif/user/del/:id', delUserArticlesAsRDF);

    }
}