function map(selector, countrydata, pesticidedata){
  worldmap = this;
  var width = 800,
    height = 500,
    centered;
  projection = d3.geo.mercator()
    .scale((width) / 2.1 / Math.PI)
    .translate([width / 2, height / 1.5])
    .precision(.1);
  path = d3.geo.path().projection(projection);
  mapsvg = d3.select(selector).append("svg")
    .attr("width", width)
    .attr("height", height)
  mapsvg.append("rect")
      .attr("class", "svgbg")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked)
      .attr("fill", "#333")
  mapsvg = mapsvg.append("g")
  function pathAnimate(selector) {
    $(selector).each(function(){
      var speed = 2.5; // seconds
      var path = $(this).get(0);
      var length = path.getTotalLength();

      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = length;
      path.style.transition = path.style.WebkitTransition = 'none';

      path.getBoundingClientRect();
      path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + speed + 's ease';
      path.style.strokeDashoffset = '0';
    });
  };
  function clicked(d) {

    //Zooming logic
    var x, y, k;
    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }
    mapsvg.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });
    mapsvg.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }
  function drawMap(countrydata, pesticidedata){
    //Add Map Paths & Fill
    mapsvg.html("").selectAll("path").data(countrydata.features).enter()
       .append("path").attr("class", "countrypath").attr("d", path)
       .attr("name", function(d){return d.properties.name_long})
       .attr("stroke", "black").attr("fill", "white")
       .attr("id", function(d){return d.properties.name_long.replace(/\s/g, "")})
       .on("click", clicked);
  }
  drawMap(countrydata, pesticidedata)
  pathAnimate(".countrypath")
}
