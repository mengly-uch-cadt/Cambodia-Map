"use strict";


/************* CLASS BASE *************/
class D3Chart {
    constructor(config) {
        this.data = config.data;
        this.domNode = config.domNode;
        this.domWidth = config.width;
        this.domHeight = config.height;
        this.margin = config.margin || { top: 20, right: 20, bottom: 20, left: 20 };
        this.colors = config.colors || d3.schemeCategory20c;
        this.keys = config.keys;
        this.axis = config.axis || {
            x: {
                type: '',
                label: '',
                wrap: false,
                rotate: 0
            },
            y: {
                label: '',
                showGrid: true,
                tick: {
                    num: 10,
                    format: d3.format('.0%')
                }
            }
        };
        this.legend = config.legend || {
            show: true,
            orient: 2
        };
        this.tooltip = config.tooltip || {
            kyes: {},
            format: '0,0'
        };

        this.initViz();
    }

    initViz() {
        // Tooltip div
        var tooltip = d3.select('body')
            .select('div.d3-tooltip-container')
            .style('display', 'none');
        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'd3-tooltip-container')
                .style('display', 'none');
        }

        // SVG container
        var svg = d3.select(this.domNode)
            .classed('d3', true)
            .append('svg')
            .attr('width', this.domWidth)
            .attr('height', this.domHeight);

        // Background Rectangle
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.domWidth)
            .attr('height', this.domHeight)
            .style('fill', 'white')
            .style('opacity', 0)
            .on('click', function () {
                d3.select('.d3-shape.selected').classed('selected', false);
            });

        this.elements = {}; //DOM Elements
        this.elements.tooltip = tooltip;
        this.elements.svg = svg;
        this.elements.container = svg.append('g');
        this.elements.legend = svg.append('g').attr('class', 'd3-legend');
    }

    drawLegend() {
        var self = this;
        var gLegend = this.elements.legend;
        var legendTexts = this.legend.texts;
        var padding = 20;

        gLegend.selectAll('*').remove();

        gLegend.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('class', 'd3-legend-title')
            .text(this.legend.title || '');

        var legendItem = gLegend
            .selectAll('g')
            .data(legendTexts)
            .enter()
            .append('g')
            .attr('class', 'd3-legend-item');

        legendItem.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', function (d, i) { return self.colors[i]; });

        legendItem.append('text')
            .attr('x', 17)
            .attr('y', 9)
            .attr('dy', '0.1em')
            .text(function (d) { return d; });

        //Item Position
        var item_dims = [];
        legendItem.each(function (d, i) {
            var dim = d3.select(this).node().getBoundingClientRect();
            var tx = 0, ty = 0;
            if (i > 0) {
                tx = item_dims[i - 1].tx + item_dims[i - 1].width + padding;
            }
            item_dims.push({ x: dim.x, y: dim.y, width: dim.width, height: dim.height, tx: tx, ty: ty });
        });
        if (this.legend.orient == 2) { //vertical
            legendItem.attr('transform', function (d, i) { return 'translate(' + [0, (legendTexts.length - 1 - i) * self.height / (self.keys.length)] + ')'; });
        } else { //horizontal
            legendItem.attr('transform', function (d, i) { return 'translate(' + [item_dims[i].tx, item_dims[i].ty] + ')'; });
        }

        //Legend Position
        var legendDim = gLegend.node().getBoundingClientRect();
        var tx = 0, ty = 0;
        if (this.legend.orient == 2) { //vertical
            tx = this.domWidth - legendDim.width - 5,
                ty = this.margin.top;
        } else { //horizontal
            tx = (this.domWidth - legendDim.width) / 2,
                ty = this.domHeight - this.margin.bottom / 2;
        }
        gLegend.attr('transform', 'translate(' + [tx, ty] + ')');
    }

}


class MapChart extends D3Chart {
    constructor(config) {
        super(config);
        this.geofolder = config.geofolder;
        this.geofile = ['province.json', 'district.json', 'commune.json'];
        this.mapShape = config.mapShape;
        this.reversed = config.reversed;
        this.legend = config.legend;
        this.tipkeys = config.tipkeys;
        this.filepath = this.geofolder + '/' + this.geofile[this.mapShape.level - 1];
        this.threshold = config.threshold || {
            key: 'hazard_index',
            range: [1, 2, 3, 4],
            comparison: 2, //1: equal or 2: between
        };
        this.elements.points = this.elements.svg.append('g').attr('class', 'd3-points-features');
        this.elements.search_path = this.elements.svg.append('g').attr('class', 'd3-path-features');
        this.ScaleCenter = {
            "scale": 7234.370677254064,
            "center": [ 1.8323501518297451, -0.21657282825779517],
            "translation": [ -12755.900208859139, 1891.7681182381737]
        };
        this.projection = d3.geoMercator()
            .scale(this.ScaleCenter.scale)
            .translate(this.ScaleCenter.translation);

        this.draw_shapes();
        this.draw_points();
    }

    draw_shapes() {
        var self = this;
        var cssClass = 'd3-map d3-map-' + this.geofile[this.mapShape.level - 1].replace('.json', '');
        this.mapFeature = this.elements.container.attr('class', 'd3-map-features');
        // this.path = d3.geoPath().projection(matrix(1, [0, 0]));

        d3.select(this.domNode).classed(cssClass, true);

        d3.json(this.filepath, function (error, geojson) {
            console.log('geodata', geojson);
            if (error) throw error;

            //initialize projection and path
            var projection = d3.geoMercator()
                .scale(1)
                .translate([0, 0]);

            var path = d3.geoPath().projection(projection);

            var dim = {width: self.domWidth, height: self.domHeight };
            var ScaleCenter = MapChart.calculateScaleCenter(path, geojson, dim);
            console.log('ScaleCenter',ScaleCenter);

            //reset projection parameter
            projection.scale(ScaleCenter.scale).translate(ScaleCenter.translation);

            self.mapFeature.selectAll('path.d3-shape')
                .data(geojson.features)
                .enter().append('path')
                .attr('class', 'd3-shape d3-shape-disabled')
                .attr('d', path);

        });

    }

    draw_points() {
        var self = this;
        var gPoints = this.elements.points
        const csvJson1 = "static/json/points_province.json";
        const csvJson2 = "static/json/points_district.json";
        const csvJson3 = "static/json/points_commune.json";
        d3.json(csvJson3, function (error, geojson) {
            console.log('points', geojson.features);
            if (error) throw error;

            gPoints.selectAll('circle.d3-shape')
                .data(geojson.features)
                .enter().append('circle')
                .attr('cx', function (d) { return self.projection(d.geometry.coordinates)[0]; })
                .attr('cy', function (d) { return self.projection(d.geometry.coordinates)[1]; })
                .attr("r", 2)
                .style("fill", "red");
        });

    }

    draw_search_path(points) {
        var self = this;
        var gSearchPath = this.elements.search_path;

        console.clear();
        console.log('draw_search_path');
        console.log(points);

        points.forEach(function(d,i) {
            d['coordinates'] = self.projection([d['longitude'],d['latitude']]);
            return d;
        });

        // Create a line generator function
        var lineGenerator = d3.line()
            .x(function(d) { return d.coordinates[0]; })
            .y(function(d) { return d.coordinates[1]; })


        // Remove old circles
        gSearchPath.selectAll("circle.searching").remove();
        gSearchPath.selectAll("path.searching").remove();

        // Append new circles
        gSearchPath.selectAll("circle.searching")
            .data(points)
            .enter()
            .append("circle")
            .attr('class', 'searching')
            .attr('cx', function (d) { return d.coordinates[0]; })
            .attr('cy', function (d) { return d.coordinates[1]; })
            .attr("r", 2)
            .style("fill", "blue");

        // Append the path to the SVG
        gSearchPath.append("path")
            .attr("d", lineGenerator(points)) // Generate the path data string from the points
            .attr('class', 'searching')
            .style("stroke", "blue")
            .style("stroke-width", 1)
            .style("fill", "none");

    }

    static calculateScaleCenter(path, features, dim) {
        // Get the bounding box of the paths (in pixels!) and calculate a
        // scale factor based on the size of the bounding box and the map
        // size.
        var width = dim.width;
        var height = dim.height;
        var bbox_path = path.bounds(features),
            scale = 0.95 / Math.max(  //90% from svg border
                (bbox_path[1][0] - bbox_path[0][0]) / width,
                (bbox_path[1][1] - bbox_path[0][1]) / height),
            translation = [
                (width - scale * (bbox_path[1][0] + bbox_path[0][0])) / 2,
                (height - scale * (bbox_path[1][1] + bbox_path[0][1])) / 2
            ],
            center = [
                (bbox_path[1][0] + bbox_path[0][0]) / 2,
                (bbox_path[1][1] + bbox_path[0][1]) / 2
            ];
        return {
            'scale': scale,
            'center': center,
            'translation': translation
        };
    }
}




function matrix(s, t) { //(a, b, c, d, tx, ty)
    //https://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations
    var a = s,
        b = 0,
        tx = t[0],
        c = 0,
        d = -s,
        ty = t[1];
    return d3.geoTransform({
        point: function (x, y) {
            this.stream.point(a * x + b * y + tx, c * x + d * y + ty);
        }
    });
}


d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};
