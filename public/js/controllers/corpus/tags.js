// includes
var TagsProcessor = require('../../modules/TagsProcessor');


module.exports = function CorpusTagsController($scope, $state, $sce) {
    $("#tagsContainer").html('<div id="l_tags" class="container"></div>');
    $("#l_tags").css('position','absolute').css('width','100%').css('height','100%');
    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/tags', function(data) {
        var processedData = TagsProcessor.processData(data);
        $("#l_tags").jQCloud(processedData,{afterCloudRender :function(){
            //do something after rendering
        }});
    });
};
