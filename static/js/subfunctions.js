function ConvertToNumber(data){
	var columns = Object.keys(data[0]);
	data.forEach(function(d, i){
		for(var j = 0; j < columns.length; j++){
			var value = d[columns[j]];
			if (isNaN(+value) === false ){
				d[columns[j]] = +value;
			}
			//else if (value.indexOf('%')!==-1){
			//	d[columns[j]] = parseFloat(value)/100;
			//}
		}
		return d;
	});
	return data;
}

function wrap(text, width) {
	text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.2, // ems
			x = text.attr("x"),
			y = text.attr("y"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}

function makePolygonPoints(center, radius, edges, rotate) {
	var crd = [];

	/* 1 SIDE CASE */
	if (edges == 1){
		return [center[0], center[1]];
	}

	var delta = rotate ? rotate * Math.PI / 180 : 0;

	/* > 1 SIDE CASEs */
	for (var i = 0; i < edges; i++) {
		var px = center[0] + (Math.sin(2 * Math.PI * i / edges + delta) * radius);
		var py = center[1] - (Math.cos(2 * Math.PI * i / edges + delta) * radius);
		crd.push([px, py]);
	}

	if (edges >= 3){ crd.push(crd[0]); }
	return crd;
}
