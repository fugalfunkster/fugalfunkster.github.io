var width = window.innerWidth * 0.8, height = window.innerHeight * 0.75;

////////////////////////////
// IMPORT AND FORMAT DATA //
////////////////////////////

d3.json("https://gist.githubusercontent.com/fugalfunkster/f00ff42bc134d5ac647acc15c3a8ce12/raw/e99ef0c7572c349f4f1e513ccd8cc5bdac2f21b0/gistfile1.txt", function(error, data){
  if(error){
    console.log(error);
  } else {
    console.log("success");
  }
 
  var repoNodes = [];
  data.forEach(function(each, index, list){
    var uniqueRepo = true;
    repoNodes.forEach(function(entry){
      if(entry.name == each.name){
        uniqueRepo = false;
      }
    });
    if(uniqueRepo){
          var radius = 0.45 * Math.min(height,width);
          var theta = index*2*Math.PI / list.length;
          var x = (width/2) + radius*Math.sin(theta);
          var y = (height/2) + radius*Math.cos(theta);
      repoNodes.push({
            "name": each.name,
            "links": [],
            "link": each.link,
            //"icon" : each.icon,
            "x": x,
            "y": y
      });
    }
  });
  repoNodes.forEach(function(node){
    data.forEach(function(each){
      if(each.name == node.name){
        if(node.links.indexOf(each.tech) == -1){
          node.links.push(each.tech);
        }
      }
    });
  });
  //console.log(repoNodes);

  var techNodes = [];
  
  data.map(function(each, index, list){
    each.tech.map(function (tech) {
      var uniqueTech = true;
      techNodes.map(function(entry){
        if(entry.tech === tech){
          uniqueTech = false;
        }
      });
      if(uniqueTech){
            var radius = 0.2 * Math.min(height,width);
            var theta = index*2*Math.PI / list.length;
            var x = (width/2) + radius*Math.sin(theta);
            var y = (height/2) + radius*Math.cos(theta);
        techNodes.push({
              "tech": tech,
              "pic" : each.techPic,
              "links": [],
              "x": x,
              "y": y
        });
      }
    })
  });
  
  techNodes.forEach(function(techNode){
    data.forEach(function(each){
        if(each.tech.indexOf(techNode.tech) != -1){
          techNode.links.push(each.name);
        }
    });
  });
  //console.log(techNodes);

  var nodes = techNodes.concat(repoNodes);
  //console.log(nodes);

  var edges = [];
  nodes.forEach(function(node, nodeIndex, nodesArray){
    if(node.links){
      node.links.forEach(function(link, linkIndex, linksArray){
        nodes.forEach(function(repo, repoIndex, nodes){
          if(repo.name){
            if(repo.name == link){
              edges.push({"source": nodeIndex, "target" : repoIndex  });
              }
          }
        });
      });
    }
  });
  //console.log(edges);

  ////////////////////////
  // USE THE FORCE LUKE //
  ////////////////////////

  var force = d3.layout.force()
    .size([width, height])
    .nodes(d3.values(nodes))
    .links(edges)
    .linkDistance((width/5))
    .charge((width/1000)* -600);

  force.on("tick", function(){
    edgeSelection
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    nodeSelection
        .attr("cx", function(d) {return d.x; })
        .attr("cy", function(d) {return d.y; });
    images
        .attr("x", function(d) {return d.x; })
        .attr("y", function(d) {return d.y; });
  });

  force.start();

  /////////////////////  
  // RENDER THE REST //
  /////////////////////

  var svg = d3.select("#graph").append("svg")
    .attr("height", height)
    .attr("width", width);

  var nodeSelection = svg.selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("circle")
    .attr("r", function(d){ return (3 + ((height / 100) * d.links.length))})
    .attr("class", "node")
    .on("click", function(d){
      if(d.link){
        window.open(d.link,'_blank');
      }
    })
    .call(force.drag);

  var images = svg.selectAll("image")
      .data(force.nodes())
      .enter()
      .append("image")
      .attr("xlink:href", function(d) {
        return d.pic;
      })
      .attr("width", width / 10 > 50 ? 50 : width / 10)
      .attr("height", height / 10 > 50 ? 50 : height / 10);
  
   var links = svg.selectAll(".node")
      .data(force.nodes())
      .enter()
      .append("a")
      .attr("xlink:href", function(d) {
        return d.link;
      })

  var edgeSelection = svg.selectAll("line")
    .data(force.links())
    .enter()
    .append("line")
    .attr("class", "line");

  ////////////////////
  // EVENT HANDLERS //
  ////////////////////

  //build a tool tip
  var tooltip = d3.select("#graph").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  nodeSelection.on("mouseover", function(d){

    d3.select(this).style("fill", "white");

    tooltip.style("opacity", .95);

    tooltip.html("<div>" + (d.name || d.tech) + "</div>")
      .style("left", (d3.event.pageX + 18) + "px")
      .style("top", (d3.event.pageY - 28) + "px");

    })
  .on("mouseout", function(){

      d3.select(this).style("fill", "black");

      tooltip.style("opacity", 0);

   });

  
});

  
