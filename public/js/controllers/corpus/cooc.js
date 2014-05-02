// includes
var CoocProcesser = require('../../modules/CoocProcesser');
var d3 = window.d3 || null;

var matrix_mouseover = function (p) {
    var g = d3.select(this).node();
    $('#'+g.id).css('cursor','pointer');
    d3.selectAll('.row text').classed('active', function(d, i) { return i === p.y; });
    d3.selectAll('.column text').classed('active', function(d, i) { return i === p.x; });
};

var matrix_mouseout = function () {
    d3.selectAll('text').classed('active', false);
};

var matrix_order = function (svg,orders,x,value) {
    x.domain(orders[value]);

    var t = svg.transition().duration(1500);
    t.selectAll('.row')
        .delay(function(d, i) { return x(i) * 4; })
        .attr('transform', function(d, i) { return 'translate(0,' + x(i) + ')'; })
        .selectAll('.cell')
        .delay(function(d) { return x(d.x) * 4; })
        .attr('x', function(d) { return x(d.x); });

    t.selectAll('.column')
        .delay(function(d, i) { return x(i) * 4; })
        .attr('transform', function(d, i) { return 'translate(' + x(i) + ')rotate(-90)'; });
};

 //renders the d3 graph
var createCoocMatrix = function (miserables, container) {
    var margin = {top: 80, right: 0, bottom: 10, left: 80};
    var width = 1000;
    var height = 1000;

    var x = d3.scale.ordinal().rangeBands([0, width]);
    var z = d3.scale.linear().domain([0, 4]).clamp(true);
    var c = d3.scale.category20().domain(d3.range(20));

    var svg = d3.select(container).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style('margin-left', -margin.left + 'px')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var matrix = [];
    var nodes = miserables.nodes;
    var n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    // Convert links to matrix; count character occurrences.
    miserables.links.forEach(function(link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
        matrix[link.source][link.source].z += link.value;
        matrix[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });
    // Precompute the orders.
    var orders = {
        name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
        group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
    };
    // The default sort order.
    x.domain(orders.name);
    svg.append('rect')
        .attr('class', 'cell-background')
        .attr('width', width)
        .attr('height', height);

    var processRow = function (row) {
        var cell = d3.select(this).selectAll('.cell')
            .data(row.filter(function(d) { return d.z; }))
            .enter().append('rect')
            .attr('class', 'cell')
            .attr('x', function(d) { return x(d.x); })
            .attr('width', x.rangeBand())
            .attr('height', x.rangeBand())
            .attr('id', function(d) { return 'rel_'+nodes[d.x].index+'_'+nodes[d.y].index; })
            .style('fill-opacity', function(d) { return z(d.z); })
            .style('fill', function(d) { return nodes[d.x].group === nodes[d.y].group ? c(nodes[d.x].group) : null; })
            .on('mouseover', matrix_mouseover)
            .on('mouseout', function(d) { matrix_mouseout(d); });
    };

    var row = svg.selectAll('.row')
        .data(matrix)
        .enter().append('g')
        .attr('class', 'row')
        .attr('transform', function(d, i) { return 'translate(0,' + x(i) + ')'; })
        .each(processRow);

    row.append('line').attr('x2', width);

    row.append('text')
        .attr('x', -6)
        .attr('y', x.rangeBand() / 2)
        .attr('dy', '.32em')
        .attr('text-anchor', 'end')
        .attr('id', function(d, i) { return 'node_'+nodes[i].index; })
        .attr('title', function(d, i) { return nodes[i].uri; })
        .text(function(d, i) { return nodes[i].name; });

    var column = svg.selectAll('.column')
        .data(matrix)
        .enter().append('g')
        .attr('class', 'column')
        .attr('transform', function(d, i) { return 'translate(' + x(i) + ')rotate(-90)'; });

    column.append('line')
        .attr('x1', -width);

    column.append('text')
        .attr('x', 6)
        .attr('y', x.rangeBand() / 2)
        .attr('dy', '.32em')
        .attr('id', function(d, i) { return 'node_'+nodes[i].index; })
        .attr('title', function(d, i) { return nodes[i].uri; })
        .attr('text-anchor', 'start')
        .text(function(d, i) { return nodes[i].name; });

    $(container).append('<div class="matrix-color-legend"><table cellpadding="5" cellspacing="3"></table></div>');
    var not_repeat=[];
    $.each(miserables.nodes,function(i,v){
        if(not_repeat.indexOf(v.group) === -1){
            not_repeat.push(v.group);
            $(container+' .matrix-color-legend table').append('<tr style="color:#FFF;background-color:'+c(v.group)+'"><td>'+miserables.groups[v.group]+'</td></tr>');
        }
    });
    $(container+' .matrix-color-legend').attr('style','position:absolute;top:300px;right:10px;overflow:hidden;');

    var timeout = setTimeout(function() {
        matrix_order(svg,orders,x,'group');
    }, 500);
};

module.exports = function CorpusCoocController($scope, $state, $sce) {
    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/cooc', function(data) {
        var processedData = CoocProcesser.processData(data);
        createCoocMatrix(processedData,'#coocContainer');
    });
};
