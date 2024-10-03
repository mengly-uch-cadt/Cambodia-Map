"use strict";


var CSSCLASS = {
    target: 'd3-target',
    chart: 'd3-chart',
    chartLine: 'd3-chart-line',
    chartLines: 'd3-chart-lines',
    chartBar: 'd3-chart-bar',
    chartBars: 'd3-chart-bars',
    chartText: 'd3-chart-text',
    chartTexts: 'd3-chart-texts',
    chartArc: 'd3-chart-arc',
    chartArcs: 'd3-chart-arcs',
    chartArcsTitle: 'd3-chart-arcs-title',
    chartArcsBackground: 'd3-chart-arcs-background',
    chartArcsGaugeUnit: 'd3-chart-arcs-gauge-unit',
    chartArcsGaugeMax: 'd3-chart-arcs-gauge-max',
    chartArcsGaugeMin: 'd3-chart-arcs-gauge-min',
    selectedCircle: 'd3-selected-circle',
    selectedCircles: 'd3-selected-circles',
    eventRect: 'd3-event-rect',
    eventRects: 'd3-event-rects',
    eventRectsSingle: 'd3-event-rects-single',
    eventRectsMultiple: 'd3-event-rects-multiple',
    zoomRect: 'd3-zoom-rect',
    brush: 'd3-brush',
    dragZoom: 'd3-drag-zoom',
    focused: 'd3-focused',
    defocused: 'd3-defocused',
    region: 'd3-region',
    regions: 'd3-regions',
    title: 'd3-title',
    tooltipContainer: 'd3-tooltip-container',
    tooltip: 'd3-tooltip',
    tooltipName: 'd3-tooltip-name',
    shape: 'd3-shape',
    shapes: 'd3-shapes',
    line: 'd3-line',
    lines: 'd3-lines',
    bar: 'd3-bar',
    bars: 'd3-bars',
    circle: 'd3-circle',
    circles: 'd3-circles',
    arc: 'd3-arc',
    arcLabelLine: 'd3-arc-label-line',
    arcs: 'd3-arcs',
    area: 'd3-area',
    areas: 'd3-areas',
    empty: 'd3-empty',
    text: 'd3-text',
    texts: 'd3-texts',
    gaugeValue: 'd3-gauge-value',
    grid: 'd3-grid',
    gridLines: 'd3-grid-lines',
    xgrid: 'd3-xgrid',
    xgrids: 'd3-xgrids',
    xgridLine: 'd3-xgrid-line',
    xgridLines: 'd3-xgrid-lines',
    xgridFocus: 'd3-xgrid-focus',
    ygrid: 'd3-ygrid',
    ygrids: 'd3-ygrids',
    ygridLine: 'd3-ygrid-line',
    ygridLines: 'd3-ygrid-lines',
    colorScale: 'd3-colorscale',
    stanfordElements: 'd3-stanford-elements',
    stanfordLine: 'd3-stanford-line',
    stanfordLines: 'd3-stanford-lines',
    stanfordRegion: 'd3-stanford-region',
    stanfordRegions: 'd3-stanford-regions',
    stanfordText: 'd3-stanford-text',
    stanfordTexts: 'd3-stanford-texts',
    axis: 'd3-axis',
    axisX: 'd3-axis-x',
    axisXLabel: 'd3-axis-x-label',
    axisY: 'd3-axis-y',
    axisYLabel: 'd3-axis-y-label',
    axisY2: 'd3-axis-y2',
    axisY2Label: 'd3-axis-y2-label',
    legend: 'd3-legend',
    legendBackground: 'd3-legend-background',
    legendItem: 'd3-legend-item',
    legendItemEvent: 'd3-legend-item-event',
    legendItemTile: 'd3-legend-item-tile',
    legendItemHidden: 'd3-legend-item-hidden',
    legendItemFocused: 'd3-legend-item-focused',
    dragarea: 'd3-dragarea',
    EXPANDED: '_expanded_',
    SELECTED: '_selected_',
    INCLUDED: '_included_'
};

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

    /** UNDER CONSTRUCTION!
    showTooltip(){
        this.elements.tooltip.style('display','block').html(content);
    }

    moveTooltip(){
        var dimBody = d3.select("body").node().getBoundingClientRect();
        var dim = self.elements.tooltip.node().getBoundingClientRect();
        var mouse = [d3.event.x, d3.event.y];
        var x = mouse[0] - dim.width / 2;
        var y = mouse[1] - dim.height - 10;
        if (x < 0){ x = 0;}
        if (x > dimBody.width - dim.width){ x = dimBody.width - dim.width;}
        if (y < 0){ y += dim.height + 20;}
        self.elements.tooltip.style('left', x + 'px').style('top', y + 'px');
    })

    hideTooltip(){
        this.elements.tooltip.style('display','none');
    }
    */
}


class MapChart extends D3Chart {
    constructor(config) {
        super(config);
        this.geofolder = config.geofolder || '../assets/json/2020';
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
        this.render();
    }

    render() {
        var self = this;
        this.path = d3.geoPath().projection(matrix(1, [0, 0]));
        this.mapFeature = this.elements.container.attr('class', 'd3-map-features');
        var cssClass = 'd3-map d3-map-' + this.geofile[this.mapShape.level - 1].replace('.json', '');

        d3.select(this.domNode).classed(cssClass, true);

        d3.json(this.filepath, function (error, geodata) {
            if (error) throw error;

            self.centerZoom(geodata);
            self.drawSubUnits(geodata);
            // self.drawPlaces(geodata);
            // self.drawOuterBoundary(geodata);

            if (self.data) { self.applyNumeric(self.data); }
        });

        // Define the zoom and attach it to the map
        // var zoom = d3.zoom()
        //     .scaleExtent([1, 10])
        //     .on('zoom', doZoom);
        // svg.call(zoom);

        //window.addEventListener('resize', resize);

        // function resize(){
        //     var width = window.innerWidth,
        //         height = window.innerHeight;

        //     svg.attr('width', width).attr('height', height);

        //     centerZoom(geo, width, height);

        //     svg.selectAll('path').attr('d', path);
        //     svg.selectAll('text').attr('transform', function(d){ return 'translate(' + projection(d.geometry.coordinates) + ')'; });
        // }

    }

    getFillColor(value) { // UNDER CONSTRUCTION
        var limits = this.limits;
        if (this.threshold.comparison == 2) {
            if (value < limits[0]) {
                return this.colors[0];
            } else if (value >= limits[limits.length - 1]) {
                return this.colors[limits.length - 2];
            } else {
                for (var j = 0; j < limits.length - 1; j++) {
                    if (value >= limits[j] && value < limits[j + 1]) {
                        return this.colors[j];
                    }
                }
            }
        } else {
            var idx = limits.indexOf(value);
            if (idx !== -1) {
                return this.colors[idx];
            }
        }
        return null;
    }

    applyNumeric(data) {
        this.data = data;
        var self = this;
        var breakType = 'e';
        var breakCount = this.colors.length;
        if (typeof (this.threshold.range) === 'undefined') {
            this.limits = chroma.limits(data.map(function (d) {
                return +d[self.threshold.key];
            }), breakType, breakCount);
        } else {
            this.limits = this.threshold.range;
        }
        this.fillSubUnits();
        if (this.legend.show) {
            this.drawLegend();
        }
        this.drawTooltip();
    }

    drawLegend() {
        var self = this;
        var padding = 20;
        var gLegend = this.elements.legend;
        var limits = this.limits;

        gLegend.selectAll('*').remove();

        var background = gLegend.append('rect')
            .style('fill', 'white')
            .style('stroke', 'none');

        gLegend.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('class', 'd3-legend-title')
            .text(this.legend.title);

        var legendItem = gLegend.selectAll('g')
            .data(self.colors)
            .enter()
            .append('g')
            .attr('class', 'd3-legend-item')
            .attr('transform', function (d, i) {
                var j = (self.legend.reversed === true) ? self.colors.length - i - 1 : i;
                return 'translate(' + [0, j * padding + padding / 2] + ')';
            });

        legendItem.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', 12)
            .style('fill', function (d) { return d; });

        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 5)
            .attr('dy', '0.4em')
            .text(function (d, i) {
                if (self.legend.items) {
                    return self.legend.items[i];
                } else if (self.legend.format) {
                    var fm = self.legend.format;
                    return numeral(limits[i]).format(fm) + ' to ' + numeral(limits[i + 1]).format(fm);
                } else {
                    return limits[i] + ' to ' + limits[i + 1];
                }
            });

        //Legend Position
        var legendDim = gLegend.node().getBoundingClientRect();
        background.attr('x', 0)
            .attr('y', 0)
            .attr('width', legendDim.width + padding * 2)
            .attr('height', legendDim.height + padding * 1)
            .attr('transform', 'translate(' + [-padding, -padding] + ')');
        var tx = this.domWidth - legendDim.width - padding * 2,
            ty = this.domHeight - legendDim.height - padding * 0;
        gLegend.attr('transform', 'translate(' + [tx, ty] + ')');
    }

    fillSubUnits() {
        var self = this;
        this.mapFeature.selectAll('path.d3-shape')
            .classed('d3-map-active', false)
            .style('fill', function (d, i) {
                var match = self.matchData(d, self.data);
                if (match) { //match is defined then return a color
                    d3.select(this).classed('d3-map-active', true);
                    return self.getFillColor(+match[self.threshold.key]);
                } else {
                    return null;
                }
            });
    }

    drawTooltip() {
        var self = this;
        var data = this.data;
        this.mapFeature.selectAll('.d3-shape')
            .on('mouseover', function (d) {
                var match = self.matchData(d, data);
                if (typeof (match) !== 'undefined') {
                    var content = self.tipkeys.map(function (d) {
                        var text = d.text;
                        var value = d.format ? numeral(match[d.key]).format(d.format) : match[d.key];
                        return '<tr><td>' + text + ': </td><td>' + value + '</td></tr>';
                    }).join('');
                    var htmlString = '<table class="d3-tooltip">' + content + '</table>';
                    d3.select(this).moveToFront();
                    self.elements.tooltip.style('display', 'block').html(htmlString);
                    self.elements.svg.selectAll('.place').moveToFront();
                    self.elements.svg.selectAll('.place-label').moveToFront();
                }
            })
            .on('mousemove', function () {
                var dimBody = d3.select("body").node().getBoundingClientRect();
                var dim = self.elements.tooltip.node().getBoundingClientRect();
                var mouse = [d3.event.x, d3.event.y];
                var x = mouse[0] - dim.width / 2;
                var y = mouse[1] - dim.height - 10;
                if (x < 0) { x = 0; }
                if (x > dimBody.width - dim.width) { x = dimBody.width - dim.width; }
                if (y < 0) { y += dim.height + 20; }
                self.elements.tooltip.style('left', x + 'px').style('top', y + 'px');
            })
            .on('mouseout', function () {
                self.elements.tooltip.style('display', 'none');
                d3.select('.d3-shape.selected').moveToFront();
            })
            .on('click', function (d) {
                // // var match = self.matchData(d, data);
                // var thisClass = d3.select(this).attr('class');
                // if (thisClass.indexOf('selected')!==-1){ //.includes('selected')
                //     d3.select(this).classed('selected',false);
                // } else {
                //     self.elements.svg.select('.d3-shape.selected').classed('selected',false);
                //     d3.select(this).classed('selected', true).moveToFront();
                // }
            });
    }

    matchData(d, data) {
        var mapShape = this.mapShape;
        return data.filter(function (e) {
            return d.properties[mapShape.geo] == e[mapShape.csv];
        })[0];
    }

    centerZoom(data) {//path, data, dim
        // Apply scale, center and translate paramenters.
        var dim = {};
        dim.width = this.domWidth;
        dim.height = this.domHeight;
        var ScaleCenter = MapChart.calculateScaleCenter(this.path, data, dim);
        this.path.projection(matrix(ScaleCenter.scale, ScaleCenter.translation)); //Set scale and translation
        // projection.fitSize([width, height], topojson.feature(data, data.objects.polygons));
    }

    drawOuterBoundary(geojson) { //not working yet
        this.mapFeature.append('path')
            .datum(topojson.mesh(geojson, geojson.features, function (a, b) { return a === b; })) //boundary
            .attr('d', path)
            .attr('class', 'd3-shape-boundary');
    }

    drawPlaces(geojson) {
        this.mapFeature.append('path')
            .datum(topojson.feature(geojson, geojson.objects.places))
            .attr('d', path)
            .attr('class', 'place');

        this.mapFeature.selectAll('.place-label')
            .data(topojson.feature(geojson, geojson.objects.places).features)
            .enter().append('text')
            .attr('class', 'place-label')
            .attr('transform', function (d) { return 'translate(' + projection(d.geometry.coordinates) + ')'; })
            .attr('dy', '.35em')
            .attr('x', function (d) { return projection(d.geometry.coordinates)[0] <= width / 2 ? -6 : 6; })
            .style('text-anchor', function (d) { return projection(d.geometry.coordinates)[0] <= width / 2 ? 'end' : 'start'; })
            .text(function (d) { return d.properties.name; });
    }

    drawSubUnits(geojson) {
        this.mapFeature.selectAll('path.d3-shape')
            .data(geojson.features)
            .enter().append('path')
            .attr('class', 'd3-shape d3-shape-disabled')
            .attr('d', this.path);
    }

    doZoom() {
        var x = d3.event.transform.x;
        var y = d3.event.transform.y;
        var k = d3.event.transform.k;
        this.mapFeature.attr('transform', 'translate(' + [x, y] + ') scale(' + k + ')')
            .style('stroke-width', 0.5 / d3.event.scale + 'px');
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


class BarChart extends D3Chart {
    constructor(config) {
        super(config);
        this.padding = config.padding || 0.5;
        this.xaxis = config.xaxis;
        this.yaxis = config.yaxis;
        this.legend = config.legend;
        this.format = config.format;
        this.chartType = config.type || 1; //1=stacked, 2=grouped
        this.width = this.domWidth - this.margin.left - this.margin.right;
        this.height = this.domHeight - this.margin.bottom - this.margin.top;
        this.title = { show: false, text: 'title' };

        // this.createScales();

        if (this.data) {
            this.render(this.data);
        }
    }

    createScales() { //under construction
        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .paddingInner(this.bar.padding)
            .paddingOuter(0);

        this.yScale = d3.scaleLinear()
            .range([this.height, 0]);

        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
    }

    render(data) {
        var self = this;

        this.data = data;

        var keys = this.objects ? this.objects.map(function (d) { return d.key; }) : Object.keys(data[0]);
        var gContainer = this.elements.container.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        var gGrid = gContainer.append('g').attr('class', 'd3-grid');
        this.legend.texts = this.objects ? this.objects.map(function (d) { return d.text; }).slice(1) : keys.slice(1);
        this.keys = keys;
        var ymax = d3.max(data, function (d) { return d3.sum(keys.slice(1).map(function (k) { return d[k]; })); });

        // TITLE ***
        if (this.title.show) {
            var gTitle = this.elements.svg.append('g')
                .attr('class', 'chart-title')
                .attr('transform', 'translate(' + [this.domWidth / 2, this.margin.top / 2] + ')');

            gTitle.append('text')
                .attr('dy', '0.5em')
                .text(this.title.text)
                .style('text-anchor', 'middle');
        }

        // SCALES ***
        var xScale = d3.scaleBand()
            .domain(data.map(function (d) { return d[keys[0]]; }))
            .range([0, this.width])
            .padding(this.padding);
        //.align(0.1)

        var barWidth = Math.min(xScale.bandwidth(), 100);

        var yScale = d3.scaleLinear()
            .domain([0, ymax])
            .range([this.height, 0]);

        var stack = d3.stack()
            //.offset(d3.stackOffsetExpand)
            .keys(keys.slice(1))
            (data);

        // X-AXIS ***
        gContainer.append('g')
            .attr('class', 'd3-axis d3-axis-x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3.axisBottom(xScale));

        if (this.xaxis.wrap === true) {
            gContainer.selectAll('.tick text')
                .call(wrap, xScale.bandwidth());
        }

        if (typeof (this.xaxis.rotate) !== 'undefined') {
            gContainer.selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-' + this.xaxis.rotate + ')');
        }

        // Y-AXIS ***
        var yAxis = d3.axisLeft(yScale)
            .ticks(this.yaxis.numTicks, 's');

        gContainer.append('g')
            .attr('class', 'd3-axis d3-axis-y')
            .call(yAxis);

        //Gridline:
        if (this.yaxis.showGrid === true) {
            gGrid.append('g')
                .attr('class', 'd3-grid-y')
                .call(yAxis.tickFormat('').tickSize(-this.width));
        }

        //series of bars -----------------------------------------------------------------
        var gBars = gContainer.append('g')
            .attr('class', 'd3-chart-bars')
            .selectAll('g.d3-chart-bar')
            .data(stack)
            .enter()
            .append('g')
            .attr('class', function (d, i) { return 'd3-chart-bar d3-group-' + i; })
            .attr('order', function (d, i) { return i; })
            .attr('fill', function (d, i) { return self.colors[i]; });

        var rects = gBars.selectAll('rect.d3-shape')
            .data(function (d) { return d; })
            .enter()
            .append('rect')
            .attr('class', 'd3-shape')
            .attr('x', function (d) { return xScale(d.data[keys[0]]) + (xScale.bandwidth() - barWidth) / 2; })
            .attr('y', function (d) { return yScale(d[1]); })
            .attr('height', function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr('width', barWidth);

        // Bar Labels ***
        if (typeof (this.lebels) !== 'undefined' && this.lebels.show) {
            gContainer.append('g')
                .attr('class', 'top-text')
                .selectAll('text')
                .data(stack[stack.length - 1])
                .enter().append('text')
                .attr('x', function (d) { return xScale(d.data[keys[0]]) + xScale.bandwidth() / 2; })
                .attr('y', function (d) { return yScale(d[1]) - 5; })
                .text(function (d) { return numeral(d[1]).format(this.format); })
                .style('text-anchor', 'middle')
                .style('font-size', 12)
                .style('fill', 'black');
        }

        // Tooltips ***
        rects.on('mouseover', function (d) {
            var i = +d3.select(this.parentNode).attr('order');
            if (self.objects) {
                var text1 = self.objects[0].text,
                    text2 = self.objects[i + 1].text,
                    value1 = d.data[keys[0]],
                    value2 = numeral(d.data[keys[i + 1]]).format(self.format);
            } else {
                var text1 = keys[0],
                    text2 = keys[i + 1],
                    value1 = d.data[keys[0]],
                    value2 = numeral(d.data[keys[i + 1]]).format(self.format);
            }
            var content = '<table class="d3-tooltip">'
                + '<tr><td>' + text1 + ': </td><td>' + value1 + '</td></tr>'
                + '<tr><td>' + text2 + ': </td><td>' + value2 + '</td></tr>'
                + '</table>';
            self.elements.tooltip.style('display', 'block').html(content);
        })
            .on('mousemove', function () {
                var mouse = [d3.event.x, d3.event.y];
                var dim = self.elements.tooltip.node().getBoundingClientRect();
                var x = mouse[0] - dim.width / 2;
                var y = mouse[1] - dim.height - 10;
                self.elements.tooltip.style('left', x + 'px').style('top', y + 'px');
            })
            .on('mouseout', function () {
                self.elements.tooltip.style('display', 'none');
            });

        if (this.legend.show) {
            this.drawLegend();
        }
    }

    update(data) {
    }
}


class BarChart2 extends D3Chart {
    constructor(config) {
        super(config);
        this.bar = {
            padding: 0.2,
        };
        this.legend = config.legend;
        this.format = config.format;
        this.width = this.domWidth - this.margin.left - this.margin.right;
        this.height = this.domHeight - this.margin.bottom - this.margin.top;

        this.createScales();
        this.render();
    }

    createScales() {
        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .paddingInner(this.bar.padding)
            .paddingOuter(0);

        this.yScale = d3.scaleLinear()
            .range([this.height, 0]);

        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
    }

    render() {
        //Chart Container
        var gContainer = this.elements.container.attr('transform', 'translate(' + [this.margin.left, this.margin.top] + ')');

        //Gridlines
        this.elements.ygrid = gContainer.append('g')
            .attr('class', 'd3-grid')
            .call(d3.axisLeft(this.yScale).tickFormat('').tickSize(-this.width));

        //X-axis
        this.elements.xaxis = gContainer.append('g')
            .attr('class', 'd3-axis d3-axis-x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3.axisBottom(this.xScale));

        this.elements.xlabel = this.elements.xaxis.append('text')
            .attr('class', 'd3-axis-x-label')
            .attr('transform', 'translate(' + [this.width, -this.height * 0.1] + ')')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .text(this.axis.x.label)
            .style('text-anchor', 'end');

        //Y-axis
        this.elements.yaxis = gContainer.append('g')
            .attr('class', 'd3-axis d3-axis-y')
            .call(d3.axisLeft(this.yScale));

        this.elements.ylabel = this.elements.yaxis
            .append('text')
            .attr('class', 'd3-axis-y-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .text(this.axis.y.label);

        //Line container
        this.elements.graph = gContainer.append('g').attr('class', 'd3-chart-lines');

        if (this.data) {
            this.update(this.data);
        }
    }

    update(data) {
        var self = this;
        var fm = data[0].fm; //format y-axis

        //set domain values to scale
        this.xScale.domain(data.map(function (d) { return d.x; }));
        this.yScale.domain([0, d3.max(data, function (d) { return d.y; })]);

        //select all bars on the graph, take them out, and exit the previous data set.
        //then you can add/enter the new data set
        var bars = this.elements.graph.selectAll('rect.d3-bar').data(data);

        // Add bars for new data
        bars.enter()
            .append('rect')
            .attr('class', 'd3-shape d3-bar')
            .attr('x', function (d) { return self.xScale(d.x); })
            .attr('y', function (d) { return self.yScale(d.y); })
            .attr('width', self.xScale.bandwidth())
            .attr('height', function (d) { return self.height - self.yScale(d.y); })
            .style('fill', self.colors[0])
            .on('mouseover', function (d) {
                var content = '<table class="d3-tooltip">'
                    + '<tr><td>' + d.x + ': </td><td>' + numeral(d.y).format(d.fm) + '</td></tr>'
                    + '</table>';
                self.elements.tooltip.style('display', 'block').html(content);
            })
            .on('mousemove', function () {
                var mouse = [d3.event.x, d3.event.y];
                var dim = self.elements.tooltip.node().getBoundingClientRect();
                var x = mouse[0] - dim.width / 2;
                var y = mouse[1] - dim.height - 10;
                self.elements.tooltip.style('left', x + 'px').style('top', y + 'px');
            })
            .on('mouseout', function () {
                self.elements.tooltip.style('display', 'none');
            });

        // Update old ones, already have x, y, width, height from before
        bars.transition()
            .duration(500)
            .attr('x', function (d) { return self.xScale(d.x); })
            .attr('y', function (d) { return self.yScale(d.y); })
            .attr('width', self.xScale.bandwidth())
            .attr('height', function (d) { return self.height - self.yScale(d.y); });

        // Remove old ones
        bars.exit().remove();

        //Update Axes & Gridlines
        this.elements.yaxis.call(self.yAxis)
            .selectAll('text')
            .text(function (d) { return numeral(d).format(fm); });

        this.elements.xaxis.call(self.xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        this.elements.ygrid.call(d3.axisLeft(self.yScale).tickFormat('').tickSize(-self.width));
    }
}


class LineChart extends D3Chart {
    constructor(config) {
        super(config);
        this.format = config.format;
        this.width = this.domWidth - this.margin.left - this.margin.right;
        this.height = this.domHeight - this.margin.bottom - this.margin.top;

        this.createScales();
        this.render();
    }

    createScales() {
        var self = this;

        this.xScale = d3.scaleBand()
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .range([this.height, 0]);

        this.lineFunc = d3.line()
            //.curve(d3.curveBasis)
            .x(function (d) { return self.xScale(d.x); })
            .y(function (d) { return self.yScale(d.y); });

        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
    }

    render() {
        //Chart Container
        var gContainer = this.elements.container.attr('transform', 'translate(' + [this.margin.left, this.margin.top] + ')');

        //Gridlines
        this.elements.ygrid = gContainer.append('g')
            .attr('class', 'd3-grid')
            .call(d3.axisLeft(this.yScale).tickFormat('').tickSize(-this.width));

        //X-axis
        this.elements.xaxis = gContainer.append('g')
            .attr('class', 'd3-axis d3-axis-x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3.axisBottom(this.xScale));

        this.elements.xlabel = this.elements.xaxis.append('text')
            .attr('class', 'd3-axis-x-label')
            .attr('transform', 'translate(' + [this.width, -this.height * 0.1] + ')')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .text(this.axis.x.label)
            .style('text-anchor', 'end');

        //Y-axis
        this.elements.yaxis = gContainer.append('g')
            .attr('class', 'd3-axis d3-axis-y')
            .call(d3.axisLeft(this.yScale));

        this.elements.ylabel = this.elements.yaxis
            .append('text')
            .attr('class', 'd3-axis-y-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .text(this.axis.y.label);

        //Line container
        this.elements.graph = gContainer.append('g').attr('class', 'd3-chart-lines');

        if (this.data) {
            this.update(this.data);
        }
    }

    update(data) {
        console.log(data);
        var self = this;
        this.data = data;

        var nestData = d3.nest()
            .key(function (d) { return d.Year; })
            .entries(data)
            .map(function (nest1) {
                nest1.values = nest1.values.map(function (d) {
                    return {
                        x: d[self.keys.x],
                        y: d[self.keys.value[0]],
                    }
                });
                return nest1;
            });

        //set domain values to scale
        var yMin = 0; //set config
        var yMax = 0; //set config
        var yBound = d3.extent(data, function (d) { return d[self.keys.value[0]]; });
        this.xScale.domain(data.map(function (d) { return d[self.keys.x]; }));
        this.yScale.domain([Math.min(yMin, yBound[0]), Math.max(yMax, yBound[1])]);

        var gLines = this.elements.graph
            .selectAll('g.d3-chart-line')
            .data(nestData)
            .enter()
            .append('g')
            .attr('class', 'd3-chart-line')
            .attr('transform', 'translate(' + self.xScale.bandwidth() / 2 + ',0)');

        gLines.append('path')
            .attr('d', function (d) { return self.lineFunc(d.values); })
            .style('stroke', function (d, i) { return self.colors[i]; })
            .style('stroke-width', 2)
            .style('fill', 'none');

        gLines.selectAll('circle')
            .data(function (d) { return d.values; })
            .enter()
            .append('circle')
            .attr('r', 3)
            .attr('cx', function (d) { return self.xScale(d.x); })
            .attr('cy', function (d) { return self.yScale(d.y); })
            .style('fill', function (d) { return 'red'; });

        /*
        // Remove old ones
        lines.exit().remove();

        // Add bars for new data
        lines.enter()
            .append('rect')
            .attr('class','d3-shape d3-bar')
            .attr('x', function(d){ return self.xScale(d.x); })
            .attr('y', function(d){ return self.yScale(d.y); })
            .attr('width', self.xScale.bandwidth())
            .attr('height', function(d){ return self.height - self.yScale(d.y); })
            .style('fill', self.colors[0]);

        // Update old ones, already have x, y, width, height from before
        lines.transition()
            .duration(500)
            .attr('x', function(d){ return self.xScale(d.x); })
            .attr('y', function(d){ return self.yScale(d.y); })
            .attr('width', self.xScale.bandwidth())
            .attr('height', function(d){ return self.height -  self.yScale(d.y); });
        */

        // Update axes
        this.elements.yaxis.call(this.yAxis)
            .selectAll('text')
            .text(function (d) { return d; });

        this.elements.xaxis.call(this.xAxis);
        // .selectAll('text')
        // .style('text-anchor','end')
        // .attr('dx','-.8em')
        // .attr('dy','.15em')
        // .attr('transform','rotate(-45)');

        //update gridline
        this.elements.ygrid.call(d3.axisLeft(this.yScale).tickFormat('').tickSize(-this.width));
    }
}


class PieChart extends D3Chart {
    constructor(config) {
        super(config);
        this.width = this.domWidth - this.margin.left - this.margin.right;
        this.height = this.domHeight - this.margin.top - this.margin.bottom;
        this.radius = Math.min(this.width, this.height) * 0.45;
        this.format = config.format;

        this.createScales();
        this.render();
    }

    createScales() { //Under construction
        this.arcFunc = d3.arc()
            .outerRadius(this.radius)
            .innerRadius(0);

        this.arcLabel = d3.arc()
            .outerRadius(this.radius * 0.5)
            .innerRadius(this.radius * 0.5);

        this.pieFunc = d3.pie()
            .sort(null)
            .value(function (d) { return d.percentage; }); //percentage
    }

    render() {
        var self = this;
        var gContainer = this.elements.container.attr('transform', 'translate(' + [this.width / 2, this.height / 2] + ')');

        var gArc = gContainer.selectAll('.arc')
            .data(this.pieFunc(data))
            .enter().append('g')
            .attr('class', 'd3-arc');

        gArc.append('path')
            .attr('d', this.arcFunc)
            .attr('class', 'd3-shape')
            .style('fill', function (d, i) { return self.colors[i]; });

        gArc.append('text')
            .attr('transform', function (d) { return 'translate(' + self.arcLabel.centroid(d) + ')'; })
            .attr('dy', '.35em')
            .text(function (d) { return numeral(d.data.percentage).format(self.format); })
            .style('text-anchor', 'middle');

        //Display tooltips
        gArc.on('mouseover', function (d) {
            var content = '<table class="d3-tooltip">'
                + '<tr><td>Type: </td><td>' + d.data.type + '</td></tr>'
                + '<tr><td>Value: </td><td>' + d.data.value + '</td></tr>'
                + '</table>';
            tooltip.style('display', 'block').html(content);
        })
            .on('mousemove', function () {
                var mouse = [d3.event.x, d3.event.y];
                var dim = tooltip.node().getBoundingClientRect();
                var x = mouse[0] - dim.width / 2;
                var y = mouse[1] - dim.height - 10;
                tooltip.style('left', x + 'px').style('top', y + 'px');
            })
            .on('mouseout', function () {
                tooltip.style('display', 'none');
            });
    }

    update(data) {
        this.data = data;
    }
}


/************* FUNCTION BASE *************/
function PlotBarChart(config) {
    var domNode = config.domNode;
    var data = config.data;
    var domWidth = config.width;
    var domHeight = config.height;
    var margin = config.margin;
    var keys = config.objects ? config.objects.map(function (d) { return d.key; }) : Object.keys(data[0]);
    var colors = config.colors ? config.colors : d3.schemeCategory20c;
    var padding = config.padding || 0.5;
    var chartType = config.type == 2 ? 2 : 1; //1=stacked, 2=grouped

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

    d3.select(domNode).selectAll('*').remove();
    var svg = d3.select(domNode)
        .classed('d3', true)
        .append('svg')
        .attr('width', domWidth)
        .attr('height', domHeight);

    var width = domWidth - margin.left - margin.right,
        height = domHeight - margin.top - margin.bottom,
        gContainer = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //preparing scales ------------------------------------------------------------
    var xScale = d3.scaleBand()
        .domain(data.map(function (d) { return d[keys[0]]; }))
        .range([0, width])
        .padding(padding);
    //.align(0.1)

    var barWidth = Math.min(xScale.bandwidth(), 100);

    var xScale1 = d3.scaleBand()
        .domain(keys.slice(1))
        .range([0, xScale.bandwidth()])
        .padding(0.1);
    //.align(0.1)

    if (chartType == 1) {
        var ymax = d3.max(data, function (d) { return d3.sum(keys.slice(1).map(function (k) { return d[k]; })); });
    } else {
        var ymax = d3.max(data, function (d) { return d3.max(Object.values(d).slice(1)); });
    }
    var yScale = d3.scaleLinear()
        .domain([0, ymax])
        .range([height, 0]);

    var stack = d3.stack()
        //.offset(d3.stackOffsetExpand)
        .keys(keys.slice(1))
        (data);

    //Generate axes -------------------------------------------------------------
    //x-axis:
    gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale));

    if (config.xaxis.wrap === true) {
        gContainer.selectAll('.tick text')
            .call(wrap, xScale.bandwidth());
    }

    if (typeof (config.xaxis.rotate) !== 'undefined') {
        gContainer.selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-' + config.xaxis.rotate + ')');
    }

    //y-axis:
    var yAxis = d3.axisLeft(yScale)
        .ticks(config.yaxis.numTicks, 's');

    gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-y')
        .call(yAxis);

    //gridline:
    if (config.yaxis.showGrid === true) {
        gContainer.append('g')
            .attr('class', 'd3-grid')
            .call(yAxis.tickFormat('').tickSize(-width));
    }

    //series of bars -----------------------------------------------------------------
    if (chartType == 1) {

        var serie = gContainer.selectAll('.serie')
            .data(stack)
            .enter().append('g')
            .attr('class', 'serie')
            .attr('order', function (d, i) { return i; })
            .attr('fill', function (d, i) { return colors[i]; });

        var rects = serie.selectAll('rect.d3-shape')
            .data(function (d) { return d; })
            .enter()
            .append('rect')
            .attr('class', 'd3-shape')
            .attr('x', function (d) { return xScale(d.data[keys[0]]) + (xScale.bandwidth() - barWidth) / 2; })
            .attr('y', function (d) { return yScale(d[1]); })
            .attr('height', function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr('width', barWidth);

        //Show total above rects
        if (typeof (config.lebels) !== 'undefined' && config.lebels.show) {
            gContainer.append('g')
                .attr('class', 'top-text')
                .selectAll('text')
                .data(stack[stack.length - 1])
                .enter().append('text')
                .attr('x', function (d) { return xScale(d.data[keys[0]]) + xScale.bandwidth() / 2; })
                .attr('y', function (d) { return yScale(d[1]) - 5; })
                .text(function (d) { return numeral(d[1]).format(config.format); })
                .style('text-anchor', 'middle')
                .style('font-size', 12)
                .style('fill', 'black');
        }
    } else if (chartType == 2) {

        var serie = gContainer.selectAll('.serie')
            .data(data)
            .enter().append('g')
            .attr('class', 'serie')
            .attr('order', function (d, i) { return i; })
            .attr('transform', function (d) { return 'translate(' + xScale(d[keys[0]]) + ',0)'; });

        var rects = serie.selectAll('rect.d3-shape')
            .data(function (d) { return keys.map(function (e) { return { x: e, y: d[e] }; }).slice(1); })
            .enter()
            .append('rect')
            .attr('class', 'd3-shape')
            .attr('x', function (d,) { return xScale1(d.x); })
            .attr('y', function (d, i) { return yScale(d.y); })
            .attr('width', xScale1.bandwidth())
            .attr('height', function (d, i) { return height - yScale(d.y); })
            .attr('fill', function (d, i) { return colors[i]; });
    }

    //Generate legend -----------------------------------------------------------------
    if (config.legend && config.legend.show === true) {
        var legendTexts = config.objects ? config.objects.map(function (d) { return d.text; }).slice(1) : keys.slice(1);

        if (config.legend.orient == 2) { //vertical legend
            // legendTexts = legendTexts.reverse();
            var legend = gContainer.append('g')
                .attr('class', 'd3-legend')
                .attr('text-anchor', 'start')
                .attr('transform', 'translate(' + [width * 1.01, 0] + ')')
                .selectAll('g')
                .data(legendTexts)
                .enter()
                .append('g')
                .attr('class', 'd3-legend-item')
                .attr('transform', function (d, i) { return 'translate(' + [0, (legendTexts.length - 1 - i) * height / (keys.length)] + ')'; });

        } else { //horizontal legend
            var legend = gContainer.append('g')
                .attr('class', 'd3-legend')
                .attr('text-anchor', 'start')
                .attr('transform', 'translate(' + [0, height + margin.bottom / 2] + ')')
                .selectAll('g')
                .data(legendTexts)
                .enter()
                .append('g')
                .attr('class', 'd3-legend-item')
                .attr('transform', function (d, i) { return 'translate(' + [(i + 1) * width / (keys.length), 0] + ')'; });
        }

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', function (d, i) { return colors[i] });

        legend.append('text')
            .attr('x', 17)
            .attr('y', 7)
            .attr('dy', '0.32em')
            .text(function (d) { return d; });
    }

    //Display tooltips ------------------------------------------------
    rects.on('mouseover', function (d, idx) {
        var order = +d3.select(this.parentNode).attr('order');
        var text1, text2, value1, value2;
        if (chartType == 1) {
            var i = order;
            value1 = d.data[keys[0]];
            value2 = numeral(d.data[keys[i + 1]]).format(config.format);
        } else {
            var i = idx;
            value1 = data[order][keys[0]];
            value2 = numeral(d.y).format(config.format);
        }
        if (config.objects) {
            text1 = config.objects[0].text;
            text2 = config.objects[i + 1].text;
        } else {
            text1 = keys[0];
            text2 = keys[i + 1];
        }
        var content = '<table class="d3-tooltip">'
            + '<tr><td>' + text1 + ': </td><td>' + value1 + '</td></tr>'
            + '<tr><td>' + text2 + ': </td><td>' + value2 + '</td></tr>'
            + '</table>';
        tooltip.style('display', 'block').html(content);
    })
        .on('mousemove', function () {
            var mouse = [d3.event.x, d3.event.y];
            var dim = tooltip.node().getBoundingClientRect();
            var x = mouse[0] - dim.width / 2;
            var y = mouse[1] - dim.height - 10;
            tooltip.style('left', x + 'px').style('top', y + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('display', 'none');
        });

}


function BarLineChart(config) {
    var domNode = config.domNode;
    var data = config.data;
    var domWidth = config.width;
    var domHeight = config.height;
    var margin = config.margin;
    var keys = config.objects ? config.objects.map(function (d) { return d.key; }) : Object.keys(data[0]);
    var keysline = config.objline ? config.objline.map(function (d) { return d.key; }) : Object.keys(data[0]);
    var colors = config.colors ? config.colors : d3.schemeCategory20c;
    var padding = config.padding || 0.5;

    d3.select(domNode).selectAll('*').remove();

    // Tooltip div
    var tooltip = d3.select('body').select('div.d3-tooltip-container');
    if (tooltip.empty()) {
        tooltip = d3.select('body')
            .append('div')
            .attr('class', 'd3-tooltip-container');
    }
    tooltip.style('display', 'none');

    var svg = d3.select(domNode)
        .classed('d3', true)
        .append('svg')
        .attr('width', domWidth)
        .attr('height', domHeight);

    var width = domWidth - margin.left - margin.right,
        height = domHeight - margin.top - margin.bottom,
        gContainer = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //preparing scales ------------------------------------------------------------
    var xScale = d3.scaleBand()
        .domain(data.map(function (d) { return d[keys[0]]; }))
        .range([0, width])
        .padding(padding);
    //.align(0.1)

    // var ymax = d3.max(data, function(d){ return d3.sum(Object.values(d).slice(1));});
    var ymax = d3.max(data, function (d) { return d3.sum(keys.slice(1, 3).map(function (k) { return d[k]; })); });
    var yScale = d3.scaleLinear()
        .domain([0, ymax])
        .range([height, 0]);

    var yScale1 = d3.scaleLinear()
        .range([height, 0]);

    var line = d3.line()
        .x(function (d) { return xScale(d[keys[0]]) + xScale.bandwidth() / 2; })
        .y(function (d) { return yScale1(d[keysline[0]]); });

    var stack = d3.stack()
        //.offset(d3.stackOffsetExpand)
        .keys(keys.slice(1))
        (data);


    //Generate axes -------------------------------------------------------------
    //x-axis:
    var gxAxis = gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale));

    if (config.xaxis.wrap === true) {
        gContainer.selectAll('.tick text')
            .call(wrap, xScale.bandwidth());
    }

    if (typeof (config.xaxis.rotate) !== 'undefined') {
        gContainer.selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-' + config.xaxis.rotate + ')');
    }

    //y-axis:
    var yAxis = d3.axisLeft(yScale)
        .ticks(config.yaxis.numTicks, 's');
    // .tickFormat(function(d){ return yFormat(d); });

    var gyAxis = gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-y')
        .call(yAxis);

    //Edit y axis tick number format
    gyAxis.selectAll('.tick text')
        .each(function () {
            var self = d3.select(this);
            var text = self.text().replace('G', 'B');
            self.text(text);
        });

    // text label for the y axis
    // svg.append('text')
    // 	.attr('transform','rotate(-90)')
    // 	.attr('y', 0)
    // 	.attr('x', - height / 2)
    // 	.attr('dy','1em')
    // 	.style('text-anchor','middle')
    // 	.text('Value');

    gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-y')
        .attr('transform', 'translate( ' + width + ', 0 )')
        .call(d3.axisRight(yScale1).ticks(5, '%'));

    //gridline:
    if (config.yaxis.showGrid === true) {
        gContainer.append('g')
            .attr('class', 'd3-grid')
            .call(yAxis.tickFormat('').tickSize(-width));
    }

    //series of bars -----------------------------------------------------------------
    var serie = gContainer.selectAll('.serie')
        .data(stack)
        .enter()
        .append('g')
        .attr('class', 'serie')
        .attr('order', function (d, i) { return i; })
        .attr('fill', function (d, i) { return colors[i]; });

    var rects = serie.selectAll('rect.d3-shape')
        .data(function (d) { return d; })
        .enter()
        .append('rect')
        .attr('class', 'd3-shape')
        .attr('x', function (d) { return xScale(d.data[keys[0]]); })
        .attr('y', function (d) { return yScale(d[1]); })
        .attr('height', function (d) { return yScale(d[0]) - yScale(d[1]); })
        .attr('width', xScale.bandwidth());

    //append line
    gContainer.append('g')
        .attr('class', 'd3-line')
        .append('path')
        .attr('d', line(data))
        .style('fill', 'none')
        .style('stroke-width', '2px')
        .style('stroke', function (d, i) { return colors[i + keys.length - 1]; });

    //Generate legend -----------------------------------------------------------------
    if (config.legend && config.legend.show === true) {
        var legendTexts = config.objects ? config.objects.map(function (d) { return d.text; }).slice(1) : keys.slice(1);
        if (config.objline) {
            var legendLine = config.objline ? config.objline.map(function (d) { return d.text; }) : keysline;
            legendTexts = legendTexts.concat(legendLine);
        }
        var legend = gContainer.append('g')
            .attr('class', 'd3-legend')
            .attr('text-anchor', 'start')
            .attr('transform', 'translate(' + [0, height + margin.bottom / 2] + ')')
            .selectAll('g')
            .data(legendTexts)
            .enter().append('g')
            .attr('transform', function (d, i) { return 'translate(' + [(i + 1) * width / (legendTexts.length + 1), 0] + ')'; });

        legend.append('rect')
            .attr('x', 0)
            .attr('y', function (d, i) { return (i > legendTexts.length - legendLine.length - 1) ? 8 : 0; })
            .attr('width', 15)
            .attr('height', function (d, i) { return (i > legendTexts.length - legendLine.length - 1) ? 2 : 15; })
            .attr('fill', function (d, i) { return colors[i]; });

        legend.append('text')
            .attr('x', 0 + 15 + 2)
            .attr('y', 0 + 9)
            .attr('dy', '0.32em')
            .text(function (d) { return d; });
    }

    //Display tooltips ------------------------------------------------
    rects.on('mouseover', function (datum) {
        var i = +d3.select(this.parentNode).attr('order');
        if (config.objects) {
            var text1 = config.objects[0].text,
                text2 = config.objects[i + 1].text,
                value1 = datum.data[keys[0]],
                value2 = numeral(datum.data[keys[i + 1]]).format(config.format);
        } else {
            var text1 = keys[0],
                text2 = keys[i + 1],
                value1 = datum.data[keys[0]],
                value2 = numeral(datum.data[keys[i + 1]]).format(config.format);
        }
        var content = '<table class="d3-tooltip">'
            + '<tr><td>' + text1 + ': </td><td>' + value1 + '</td></tr>'
            + '<tr><td>' + text2 + ': </td><td>' + value2 + '</td></tr>'
            + '</table>';
        tooltip.style('display', 'block').html(content);
    })
        .on('mousemove', function () {
            var mouse = [d3.event.x, d3.event.y];
            var dim = tooltip.node().getBoundingClientRect();
            var x = mouse[0] - dim.width / 2;
            var y = mouse[1] - dim.height - 10;
            tooltip.style('left', x + 'px').style('top', y + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('display', 'none');
        });

}


function PlotLineChart(config) {
    var domNode = config.domNode;
    var data = config.data;
    var domWidth = config.width;
    var domHeight = config.height;
    var margin = config.margin;
    var keys = config.keys || Object.keys(data[0]);
    var xLabel = config.xLabel || '';
    var yLabel = config.yLabel || '';
    var colors = d3.schemeCategory20c;

    d3.select(domNode).selectAll('*').remove();

    var svg = d3.select(domNode)
        .classed('d3', true)
        .append('svg')
        .attr('width', domWidth)
        .attr('height', domHeight);

    var width = domWidth - margin.left - margin.right,
        height = domHeight - margin.top - margin.bottom,
        gContainer = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var years = data.map(function (d) { return d.Year; })
        .sort(function (a, b) { return a - b; })
        .filter(function (item, pos, arr) { return arr.indexOf(item) === pos; });

    var provinces = data.map(function (d) { return d[keys[1]]; })
        .filter(function (item, pos, arr) { return arr.indexOf(item) === pos; });

    var chartData = years.map(function (year) {
        return {
            key: year,
            value: data.filter(function (d) { return d.Year == year; })
                .map(function (d, i, arr) {
                    for (var j = 0; j < arr.length; j++) {
                        if (arr[j][keys[1]] == provinces[i]) {
                            return { x: arr[j][keys[1]], y: arr[j][keys[2]] };
                        }
                    }
                })
        };
    });

    //Scales
    var xScale = d3.scaleBand()
        .domain(provinces)
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d[keys[2]]; })])
        .range([height, 0]);

    var Color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(chartData.map(function (d) { return d.key; }));

    var line = d3.line()
        //.curve(d3.curveBasis)
        .x(function (d) { return xScale(d.x); })
        .y(function (d) { return yScale(d.y); });

    var legendTexts = Color.domain();

    //x-axis
    gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('class', 'd3-axis-x-label')
        .attr('transform', 'translate(' + [width, -height * 0.1] + ')')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .text(xLabel)
        .style('text-anchor', 'end');

    //y-axis
    gContainer.append('g')
        .attr('class', 'd3-axis d3-axis-y')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('class', 'd3-axis-y-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .text(yLabel);

    //Gridlines
    gContainer.append('g')
        .attr('class', 'd3-grid')
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-width));

    //Plot line
    var gLines = gContainer.append('g')
        .attr('class', 'd3-chart-lines')
        .attr('transform', 'translate(' + xScale.bandwidth() / 2 + ',0)');

    var gLine = gLines.selectAll('g.d3-chart-line')
        .data(chartData)
        .enter()
        .append('g')
        .attr('class', 'd3-chart-line');

    gLine.append('path')
        .attr('d', function (d) { return line(d.value); })
        .style('stroke', function (d, i) { return colors[i]; })
        .style('stroke-width', 2)
        .style('fill', 'none');

    gLine.selectAll('circle')
        .data(function (d, i) { return d.value.map(function (v) { v.fill = colors[i]; return v; }); })
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('cx', function (d) { return xScale(d.x); })
        .attr('cy', function (d) { return yScale(d.y); })
        .style('fill', function (d) { return d.fill; });

    //Legend
    var gLegend = svg.append('g')
        .attr('class', 'd3-legend');

    var legendItem = gLegend.selectAll('.d3-legend-item')
        .data(legendTexts)
        .enter()
        .append('g')
        .attr('class', 'd3-legend-item')
        .attr('transform', function (d, i) { return 'translate(' + [width, i * 20 + margin.top] + ')'; });

    legendItem.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 2)
        .style('fill', Color);

    legendItem.append('text')
        .attr('x', 26)
        .attr('dy', '.45em')
        .text(function (d) { return d; });
}


function PlotPieChart(config) {
    var domNode = config.domNode;
    var data = config.data;
    var domWidth = config.width;
    var domHeight = config.height;
    var margin = config.margin;
    var colors = config.colors ? config.colors : d3.schemeCategory20c;

    d3.select(domNode).selectAll('*').remove();

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

    var svg = d3.select(domNode)
        .classed('d3', true)
        .append('svg')
        .attr('width', domWidth)
        .attr('height', domHeight);

    var width = domWidth - margin.left - margin.right,
        height = domHeight - margin.top - margin.bottom,
        radius = Math.min(width, height) * 0.45,
        gContainer = svg.append('g').attr('transform', 'translate(' + [width / 2, height / 2] + ')');

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius * 0.5)
        .innerRadius(radius * 0.5);

    var pie = d3.pie()
        .sort(null)
        .value(function (d) { return d.percentage; });

    var gArc = gContainer.selectAll('g')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'd3-arc');

    gArc.append('path')
        .attr('d', arc)
        .attr('class', 'd3-shape')
        .style('fill', function (d, i) { return colors[i]; });

    gArc.append('text')
        .attr('transform', function (d) { return 'translate(' + labelArc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .text(function (d) { return numeral(d.data.percentage).format(config.format); })
        .style('text-anchor', 'middle');

    //Display tooltips
    gArc.on('mouseover', function (d) {
        var content = '<table class="d3-tooltip">'
            + '<tr><td>Type: </td><td>' + d.data.type + '</td></tr>'
            + '<tr><td>Value: </td><td>' + d.data.value + '</td></tr>'
            + '</table>';
        tooltip.style('display', 'block').html(content);
    })
        .on('mousemove', function () {
            var mouse = [d3.event.x, d3.event.y];
            var dim = tooltip.node().getBoundingClientRect();
            var x = mouse[0] - dim.width / 2;
            var y = mouse[1] - dim.height - 10;
            tooltip.style('left', x + 'px').style('top', y + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('display', 'none');
        });
}


function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy')),
            tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
            }
        }
    });
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
