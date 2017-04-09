/*Based off of https://bl.ocks.org/mbostock/4062045 */

let svg = d3.select("svg");
let width = svg.attr("width");
let height = svg.attr("height");
debugger;
var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody())
	.force("center", d3.forceCenter(width / 2, height / 2));

d3.json("../data/original_UDR_graph.json", function(error, graph) {
    if (error) throw error;
    debugger;
    var link = svg.append("g")
	    .attr("class", "links")
	    .selectAll("line")
	    .data(graph.links)
	    .enter().append("line");
    
    var node = svg.append("g")
	    .attr("class", "nodes")
	    .selectAll("rect")
	    .data(graph.nodes)
	    .enter().append("rect")
	    .attr("width", 20)
	    .attr("height", 10)
	    .call(d3.drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended));
    
    node.append("title")
	.text(function(d) { return d.name; });
    link.append("title")
	.text(function(d) { return d.name; });
    
    simulation
	.nodes(graph.nodes)
	.on("tick", ticked);

    simulation.force("link", d3.forceLink(graph.links));
    
    function ticked() {
	link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
	
	node
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    }
});

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
    d.fx = null;
    d.fy = null;
}


// initialize with Leemis's original layout
