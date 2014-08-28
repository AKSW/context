// includes
var RelationsProcesser = require('../../modules/RelationsProcesser');
var d3 = window.d3 || null;

// fade for d3
var fade = function(opacity, svg) {
    return function(d, i) {
        svg.selectAll('path.chord')
            .filter(function(d) {
                return d.source.index !== i && d.target.index !== i;
            })
            .transition().style('stroke-opacity', opacity)
            .style('fill-opacity', opacity);
    };
};

// renders the d3 graph
var createRelChart = function(data, container) {
    var matrix = data.relations;
    var scores = data.scores;
    var entityNames = data.entityNames;
    var entityURIs = data.entityURIs;
    // start d3
    var w = 1000;
    var h = 900;
    var r1 = h / 2;
    var r0 = r1 - 80;
    var fill = d3.scale.category20c();

    var chord = d3.layout.chord()
        .padding(0.04)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    var arc = d3.svg.arc()
        .innerRadius(r0)
        .outerRadius(r0 + 20);

    var svg = d3.select(container).append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .append('svg:g')
        .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');

    chord.matrix(matrix);

    var g = svg.selectAll('g.group')
        .data(chord.groups)
        .enter().append('svg:g')
        .attr('class', 'group')
        .on('mouseover', fade(0.02, svg))
        .on('mouseout', fade(0.80, svg));
    g.append('svg:path')
        .style('stroke', function(d) {
            return fill(d.index);
        })
        .style('fill', function(d) {
            return fill(d.index);
        })
        .attr('id', function(d) {
            return 'path_' + d.index;
        })
        .attr('d', arc);

    g.append('svg:text')
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr('dy', '.35em')
        .attr('id', function(d) {
            return 'label_' + d.index;
        })
        .attr('text-anchor', function(d) {
            return d.angle > Math.PI ? 'end' : null;
        })
        .attr('transform', function(d) {
            return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ')' +
                'translate(' + (r0 + 26) + ')' +
                (d.angle > Math.PI ? 'rotate(180)' : '');
        })
        .text(function(d) {
            return entityNames[d.index];
        });

    svg.selectAll('path.chord')
        .data(chord.chords)
        .enter().append('svg:path')
        .attr('class', 'chord')
        .style('stroke', function(d) {
            return d3.rgb(fill(d.source.index)).darker();
        })
        .style('fill', function(d) {
            return fill(d.source.index);
        })
        .attr('d', d3.svg.chord().radius(r0));

    $.each(entityNames, function(i, v) {
        $('#label_' + i).mouseover(function() {
            var position = $('#label_' + i).position();
            // console.log(v);
            $('#relations').append(
                '<div class="d3-rel-tooltip" style="top:' + (position.top +
                    30) + 'px;left:' + position.left + 'px">' + v +
                '</div>');
            $('#label_' + i).css('fill', d3.select('#path_' + i).style(
                'fill'));
            $('#label_' + i).css('cursor', 'pointer');
        });
        $('#label_' + i).mouseout(function() {
            $('#label_' + i).css('fill', '#000');
            $('#relations .d3-rel-tooltip').remove();
        });
    });
};

module.exports = function CorpusRelationsController($scope, $state, $sce) {
    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/relations',
        function(data) {
            var processedData = RelationsProcesser.processData(data);
            createRelChart(processedData, '#relationsContainer');
        });
};
