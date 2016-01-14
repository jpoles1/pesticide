function map(selector, countrydata, pesticidedata, chemdata){
  function timeplot(selector, timedata, chem){
    plt = this
    var width = 500,
      height = 600
    leftmargin = 60
    botmargin = 80
    var plotdata = [];
    for(key in timedata[chem]){
      val = timedata[chem][key]
      plotdata.push({"year": parseInt(key), "value": val})
    }
    var xScale = d3.scale.linear()
      .domain([d3.min(plotdata, function(d) {return d.year}), d3.max(plotdata, function(d) {return d.year})])
      .range([0, width-leftmargin-20])
    var yScale = d3.scale.linear()
      .domain([0, d3.max(plotdata, function(d) {return d.value})])
      .range([height, botmargin])
    var plotline = d3.svg.line()
      .x(function(d){return(xScale(d.year))}).y(function(d){return(yScale(d.value))})
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d"));
    var yAxis = d3.svg.axis().scale(yScale).orient("left")
    svg = d3.select(selector).html("").append("svg")
      .attr("width", leftmargin+width)
      .attr("height", height+botmargin)
    svg.append("rect").attr("class", "plotbg")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#333")
    svg.append("g").call(yAxis).attr("transform", "translate("+leftmargin+", "+(25-botmargin)+")")
    svg.append("g").call(xAxis).attr("transform", "translate("+leftmargin+", "+(height+((25-botmargin)))+")")
      .selectAll("text")
      .attr("transform", "rotate(-90)" )
      .attr("dx", "-1.8em")
      .attr("dy", ".5em")
    svg.append("g").attr("id", "lineplot")
      .attr("transform", "translate("+leftmargin+", "+(25-botmargin)+")")
      .append("path").attr("d", plotline(plotdata))
      .attr("stroke", "white").attr("fill", "none")
    console.log(plotdata)
    svg.append("g").attr("id", "dotplot")
      .attr("transform", "translate("+leftmargin+", "+(25-botmargin)+")")
      .selectAll("circle").data(plotdata).enter().append("circle")
      .attr("cx", function(d){return(xScale(d.year))}).attr("cy", function(d){return(yScale(d.value))})
      .attr("r", 5)
      .attr("stroke", "white").attr("fill", "white")
      .attr("class", "dot")
      .attr("title", function(d){console.log(d);return(d.year+": "+Math.round(d.value))})
    $(".dot").qtip({
      style: {classes: 'my-tooltip'},
      position: {my: "bottom left", at: "top left"}
    })
  }
  worldmap = this;
  var width = 800,
    height = 600,
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
    chem = "Chlorinated Hydrocarbons"
    chemdata = pesticidedata[d.properties.name_long][chem]
    console.log(Object.keys(chemdata).length, chemdata)
    //Zooming logic
    var x, y, k;
    if (d && centered !== d &&  chemdata != undefined) {
      new timeplot("#timeplot", pesticidedata[d.properties.name_long], chem)
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
    } else {
      new timeplot("#timeplot", chemdata, chem)
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
  mapsvg.html("").selectAll("path").data(countrydata.features).enter()
     .append("path").attr("class", "countrypath").attr("d", path)
     .attr("name", function(d){return d.properties.name_long})
     .attr("stroke", "black")
     .attr("fill", "white")
     .attr("id", function(d){return d.properties.name_long.replace(/\s/g, "")})
     .on("click", clicked);
  pathAnimate(".countrypath")
  new timeplot("#timeplot", chemdata, "Chlorinated Hydrocarbons")
}
