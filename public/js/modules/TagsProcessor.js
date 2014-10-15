
var processData = function(corpus) {
    var word_list=[];
    for (var key in corpus.tags){
        word_list.push({text:corpus.tags[key].name,weight:corpus.tags[key].count,link:{'href':key,'target':'_blank'}});
    }
    return word_list;
};

exports.processData = processData;