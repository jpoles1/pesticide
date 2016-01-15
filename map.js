function sumDict( obj ) {
  return Object.keys( obj )
   .reduce( function( sum, key ){
     return sum + parseFloat( obj[key] );
   }, 0 );
}

function map(selector, geodata, pesticidedata, chemdata, countrydata, chem){
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
      .domain([d3.min(plotdata, function(d) {return d.year})-2, d3.max(plotdata, function(d) {return d.year})+2])
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
    svg.append("g").call(yAxis).attr("fill", "white").attr("transform", "translate("+leftmargin+", "+(25-botmargin)+")")
    svg.append("g").call(xAxis).attr("fill", "white").attr("transform", "translate("+leftmargin+", "+(height+((25-botmargin)))+")")
      .selectAll("text")
      .attr("transform", "rotate(-90)" )
      .attr("dx", "-1.8em")
      .attr("dy", ".5em")
    svg.append("g").attr("id", "lineplot")
      .attr("transform", "translate("+leftmargin+", "+(25-botmargin)+")")
      .append("path").attr("d", plotline(plotdata))
      .attr("stroke", "white").attr("fill", "none")
    svg.append("g").attr("id", "dotplot")
      .attr("transform", "translate("+leftmargin+", "+(25-botmargin)+")")
      .selectAll("circle").data(plotdata).enter().append("circle")
      .attr("cx", function(d){return(xScale(d.year))}).attr("cy", function(d){return(yScale(d.value))})
      .attr("r", 5)
      .attr("stroke", "white").attr("fill", "#ccc")
      .attr("class", "dot")
      .attr("title", function(d){return(d.year+": "+Math.round(d.value))})
    $(".dot").qtip({
      style: {classes: 'my-tooltip'},
      position: {my: "bottom left", at: "top left"}
    })
  }
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
    /*try{
      chemdata = pesticidedata[d.properties.name_long][chem]
      new timeplot("#timeplot", pesticidedata[d.properties.name_long], chem)
    }
    catch(e){
      console.log("TEST")
      new timeplot("#timeplot", chemdata, chem)
    }*/
    //Zooming logic
    var x, y, k;
    if (d && centered !== d && pesticidedata[d.properties.name_long]) {
      $("#legend").hide()
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
      $("#plottitle").html("Use in "+d.properties.name_long+" (Tonnes)")
      new timeplot("#timeplot", pesticidedata[d.properties.name_long], chem)
    }
    else if(centered == d) {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
      new timeplot("#timeplot", chemdata, chem)
      $("#legend").show()
      $("#plottitle").html("Global Use (Tonnes/Year)")
    }
    else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
      new timeplot("#timeplot", chemdata, chem)
      $("#legend").show()
      $("#plottitle").html("Global Use (Tonnes/Year)")
    }
    mapsvg.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });
    mapsvg.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
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
  chembycountry = countrydata[chem]
  var maxval = 0;
  var minval = 1e7;
  for(country in chembycountry){
    var val = chembycountry[country];
    if(val>maxval) maxval =val
    if(val<minval) minval =val
  }
  console.log(minval, maxval)
  var mapcolors = d3.scale.quantize()
    .domain([minval, maxval])
    .range(colorbrewer.YlGn[7]);
  var legendGen = d3.legend.color()
    .labelFormat(d3.round)
    .shapeWidth(30)
    .scale(mapcolors);
  mapsvg = d3.select(selector).html("").append("svg")
    .attr("width", width)
    .attr("height", height)
  mapsvg.append("rect")
      .attr("class", "svgbg")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked)
      .attr("fill", "#333")
  legend = mapsvg.append("g").attr("id", "legend").attr("transform", "translate(20, "+(height-140)+")")
  mapsvg = mapsvg.append("g")
  mapsvg.html("").selectAll("path").data(geodata.features).enter()
    .append("path").attr("class", "countrypath").attr("d", path)
    .attr("name", function(d){return d.properties.name_long})
    .attr("stroke", "black")
    .attr("id", function(d){return d.properties.name_long.replace(/\s/g, "")})
    .on("click", clicked)
    .attr("fill", function(d){
      try{
       val = chembycountry[d.properties.name_long];
        if(val){
         return(mapcolors(val))
        }
        else{
         return("white")
        }
      }
      catch(e){
        return("white")
      }
    })
  legend.call(legendGen)
  legend.selectAll("text").attr("transform", "translate(43, 13)").attr("fill", "white")
  pathAnimate(".countrypath")
  $("#plottitle").html("Global Use (Tonnes/Year)")
  new timeplot("#timeplot", chemdata, chem)
}
