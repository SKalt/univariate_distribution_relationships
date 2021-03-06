/*Based off of https://bl.ocks.org/mbostock/4062045 */

let svg = d3.select("svg");
let width = svg.attr("width");
let height = svg.attr("height");

var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody())
	.force("center", d3.forceCenter(width / 2, height / 2))
	.force("collide", d3.forceCollide(15));

d3.json("../data/corrected_UDR_graph.json", function(error, graph) {
    if (error) throw error;
    var link = svg.append("g")
	    .attr("class", "links")
	    .selectAll("line")
	    .data(graph.links)
	    .enter().append("line");
    const getWidth = (d) =>(d.original_coords[2] - d.original_coords[0])/1.5;
    const getHeight = (d) =>(d.original_coords[3] - d.original_coords[1])/1.5;
    var nodeGroup = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "nodeGroup");
    
    var rects = nodeGroup.append("rect")
	    //.enter().append("rect")
	    .attr("width", getWidth)
	    .attr("height", getHeight)
	    .attr("transform", (d)=>`translate(${-getWidth(d)/2},${-getHeight(d)/2})`)
	    .call(d3.drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended));

    var circles = nodeGroup.append("circle")
	    //.enter().append("rect")
	    .attr("width", getWidth)
	    .attr("height", getHeight)
	    .attr('r', 10)
	    // .attr("transform", (d)=>`translate(${-getWidth(d)/2},${-getHeight(d)/2})`)
	    .call(d3.drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended));
    
    rects.append("title").text((d)=>d.name);
    circles.append("title").text((d)=>d.name);
    
    var nodelabels = nodeGroup.append('text')
	    .attr("x", (d)=>d.x)
	    .attr("y", (d)=>d.y)
	    .attr("class", "nodelabel")
	    .attr('text-anchor', 'middle')
	    .attr('transform', `translate(0, 8)`)
	    //.attr('textLength', getWidth)
	    .text((d)=>d.name);
   
    link.append("title")
	.text(function(d) { return d.name; });
    
    simulation
	.nodes(graph.nodes)
	.on("tick", ticked);

    simulation.force("link").links(graph.links);
    
    function ticked() {
	link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
	rects
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
	circles
	    .attr('cx', function(d) { return d.x; })
	    .attr('cy', function(d) { return d.y; });
	nodelabels
	    .attr("x", function(d) { return d.x; }) 
	    .attr("y", function(d) { return d.y; });
    }
    
    let zoom = d3.zoom().on("zoom", zoomed);
    svg.call(zoom);
    var to_transform = d3.selectAll('.nodes, .links');
    function zoomed(){
	var transform = d3.event.transform;
	to_transform.attr("transform", transform);
    }

    d3.selectAll('.nodeGroup').selectAll('rect, circle, text')
	.on(
	    'click',
	    function(d){
		d3.select('#name')
		    .text(d.name)
		    .attr('href', `http://www.math.wm.edu/` +
			  `~leemis/chart/UDR/PDFs/${d.id}.pdf`);
	    }
	);
    d3.selectAll('.links').selectAll('line')
	.on(
	    'click',
	    function(d){
		d3.select('#name')
		    .text(d.source.name + ' → ' + d.target.name)
		    .attr('href', d.href);
	    });
    originalLayout();
});

function originalLayout(){
    simulation.nodes().forEach(
	function(node){
	    node.fx = node.original_coords[0];
	    node.fy = node.original_coords[1];
	    node.fixedLayout = true;
	});
    d3.selectAll('.nodeGroup').classed('fixed', function(){
	return !/fixed/.exec(d3.select(this).attr('class'));
    });
    simulation.restart();
}

function d3Layout(){
    simulation.nodes().forEach(
	function(node){
	    node.fx = node.fy = null;
	    node.fixedLayout = false;
	}
    );
     d3.selectAll('.nodeGroup').classed('fixed', function(){
	return !/fixed/.exec(d3.select(this).attr('class'));
     });
    simulation.alphaTarget(0.3).restart();
    setTimeout(()=>simulation.alphaTarget(0), 3000);
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    if (d.fixedLayout){
	return;
    }
    d.fx = null;
    d.fy = null;
}

d3.select('button').on('click', function(){
    if (/fixed/.exec(d3.select('.nodeGroup').attr('class'))){
	// this is the original layout
	d3Layout();
    } else {
	originalLayout();
    }
});
