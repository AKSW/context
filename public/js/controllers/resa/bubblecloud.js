var rScale = d3.scale.log ()
    .domain([1, 1000])
    .range([12, 80]);
var opacScale = d3.scale.log()
    .domain([0, 1])
    .range([0.25, 1]);
var convertToSlug = function (Text) {
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}
var restart_bubbles=function () {
    node = node.data(nodes);

    var nn=node.enter().insert('g').attr("class", "node")
        .on("mouseover", bubble_mouseover)
        .on("mouseout", bubble_mouseout)
        .on("mousedown", bubble_mousedown)
        .call(force.drag)
    var c_added=nn.append("circle")
        .attr("id",function(d){return d.slug_text;})
        .attr("class", "node-circle")
        .attr("r", 1)
        .style("stroke","#999490")
        .style("stroke-width","1")
        .style("fill",function(d){return color(d.category)})
        .transition()
        .duration(500)
        .style("opacity",function(d){return opacScale(d.proportion)})
        .attr("r",function(d){return d.r});
    nn.append("text")
        .attr("id",function(d){return 't_'+d.slug_text;})
        .attr("opacity", 0)
        .attr("text-anchor", "middle")
        .attr("class", "node-text")
        .attr("style","font-size:1.4em;")
        // .attr("style","font-size:5px;")
        .text(function(d){return d.name;})
    // .transition()
    // .duration(500)
    // .attr("style","font-size:1.4em;")

    force.start();
}
function bubble_tick(e) {
    /*        node.attr("transform", function(d) { return "translate(" + d.x  + "," + d.y+ ")"; }); */
    var k = .1 * e.alpha;

    // Push nodes toward their designated focus.
    nodes.forEach(function(o, i) {
        o.y += (foci_category(o.category).y - o.y) * k;
        o.x += (foci_category(o.category).x - o.x) * k;
    });

    node.select('circle')
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    node.select('text')
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
}
function bubble_mouseover() {
    d3.select(this).select("circle")
        .style("stroke-width", 3);
    //d3.select(this).select("text").attr("opacity", 0.9);
    //console.log(d3.select(this).select("text"));
    var n_value=d3.select(this).select("text")[0][0].textContent;
    var uri=d3.select(this).select("text")[0][0].__data__.uri;
    var tmp=uri.split('http://dbpedia.org/resource/');
    var desc='';
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=1&QueryString="+tmp[1],
        async:false
    }).done(function( data ) {
        //console.log(data)
        desc=data.results[0].description
    });
    if(!desc){
        desc='';
    }
    $(d3.select(this).select("circle")).popover({
        'title': '<b>'+n_value+'</b>',
        'html':true,
        'content': '<a href="'+uri+'">'+uri+'</a><div style="text-align:justify">'+desc+'</div>',
        'container':'body'
    }).popover("show")
}

function bubble_mouseout() {
    if(! d3.select(this).classed('node-selected')){
        d3.select(this).select("circle")
            .style("stroke-width", 1);
        d3.select(this).select("text").attr("opacity", 0);
    }
    $('.popover').remove();
}
function bubble_mousedown() {
    if(! d3.select(this).classed('node-selected')){
        d3.select(this).select("circle")
            .style("stroke-width", 3);
        d3.select(this).select("text")
            // .attr("opacity", 0)
            // .attr("style","font-size:5px;")
            //.transition()
            //  .duration(300)
            .attr("style","font-size:1.4em;")
            .attr("opacity", 0.9)
        d3.select(this).classed('node-selected',true);
    }else{
        d3.select(this).classed('node-selected',false);
        d3.select(this).select("text").attr("opacity", 0);
    }

}
var color=function(entity_type){
    if(entity_type=='Person'){
        return '#d1ebbc';
    }else if(entity_type=='Place'){
        return '#b7d1e7';
    }else if(entity_type=='Organisation'){
        return '#da808d';
    }else{
        return '#fdf8ca';
    }
}
var category_no=function(entity_type){
    if(entity_type=='Person'){
        return 1;
    }else if(entity_type=='Place'){
        return 2;
    }else if(entity_type=='Organisation'){
        return 3;
    }else{
        return 0;
    }
}
var foci_category=function(entity_type){
    if(entity_type=='Person'){
        return foci[3];
    }else if(entity_type=='Place'){
        return foci[1];
    }else if(entity_type=='Organisation'){
        return foci[2];
    }else{
        return foci[0];
    }
}
var foci,force,nodes,node,width,height;
var initializeBubble = function () {
    width = 750;
    height = 800;
    var cluster_padding_x=width/4;
    var cluster_padding_y=height/4;
    foci = [{x: (width/2)-cluster_padding_x, y: (height/2)-cluster_padding_y}, {x: (width/2)+cluster_padding_x, y: (height/2)-cluster_padding_y}, {x: (width/2)-cluster_padding_x, y: (height/2)+cluster_padding_y},{x: (width/2)+cluster_padding_x, y: (height/2)+cluster_padding_y}];
    force = d3.layout.force()
        .size([width, height])
        .nodes([{}]) // initialize with a single node
        .links([])
        .gravity(0.18)
        .charge(-360)
        .friction(0.94)
        .on("tick", bubble_tick);

    var svg = d3.select("#bubblecloud").append("svg")
        .attr("width", width)
        .attr("height", height);
    svg.append("rect")
        .attr("width", width)
        .attr("height", height);
    nodes = force.nodes();
    node = svg.selectAll(".node");
};
var visualizeBubble = function ($scope,watchList,total) {
    var val,slug_text;
    var one_node_already_inserted=0;
    for (var key in watchList) {
        val = watchList[key].count / total;
        if (isNaN(val)) {
            val = 0;
        }
        slug_text=convertToSlug(key);
        if(!d3.select("#bubblecloud svg").selectAll('.node-circle[id="' + slug_text + '"]').size()){
            var start_x=width/2;
            var start_y=height/2;
            if(one_node_already_inserted>0){
                //prevent collision
                start_y=start_y-(one_node_already_inserted*15);
            }
            //var category=Math.floor(20*Math.random());
            var c_size=rScale(watchList[key].count);
            var uri=watchList[key].uri;
            var node = {x: start_x, y:start_y, name:key,n_weight:watchList[key].count, category:watchList[key].type, r:c_size, proportion:val,slug_text:slug_text,uri:uri},
                n = nodes.push(node);
            one_node_already_inserted++;
        }else{
            var new_size=rScale(watchList[key].count);
            if(d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r')!=new_size){
                d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r',new_size/2).transition().duration(700).attr('r',new_size);
            }
        }
    }
    restart_bubbles();
};
var clearBubbleView=function(){
    setTimeout(function(){
        d3.select("#bubblecloud svg").selectAll('g').remove();
    },1000)
}
exports.initializeBubble = initializeBubble;
exports.visualizeBubble = visualizeBubble;
exports.clearBubbleView = clearBubbleView;