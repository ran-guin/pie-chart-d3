import * as d3 from 'd3'
import d3Svg from 'svg-d3'

function checkDefaults (options) {
  const set = d3Svg.setOptions('bar', options)
  console.log('default settings: ' + JSON.stringify(set))
  return set
}

function addPie(options) {   
  console.log('add pie chart: ' + JSON.stringify(options))
  var svg = options.svg || (options.svg = d3Svg.initSvg({clear: true}));
  
  var data = options.data       // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]


  if (options.petals) {
    // add before pie chart to keep curve filling from overlaying outside of ring
    this.addPetals(options)
  }

  const set = d3Svg.setOptions('pie', options)
  console.log('default settings: ' + JSON.stringify(set))
  
  const color = set.color
  var colours = set.colours || data.map((a,i) => color(i));

  var radius = options.radius || options.outerRadius || Math.min(set.width, set.height) / 3
  
  var canvas = svg.append("g")
    .attr("transform", "translate(" + set.width / 2 + "," + set.height / 2 + ")");

  const arc = d3.arc()
    .innerRadius(set.innerRadius)
    .outerRadius(radius)

  console.log('add data')

  var pie = d3.pie()
    .value(function(d) { return d[set.valueCol]; });
  
  // canvas.
  canvas.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
      .attr("class", 'arc')
        .append("path")
          .attr("d", arc)
          .attr("fill", (d, i) => colours[i])
          .attr("stroke", set.stroke)
          .attr("stroke-ypos", "1px")
          .on("mouseenter", function(d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 0.5);
            d3.select('#Legend' + d[set.labelCol]) // NOT WORKING (?)
              .transition()
              .duration(200)
              .attr("opacity", 0.5);
          })
          .on("mouseout", function(d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 1);
            d3.select('#Legend' + d[set.labelCol]) // NOT WORKING (?)
              .transition()
              .duration(200)
              .attr("opacity", 1);
          });
    
  options.radius = radius

  this.addLabels(options)
  console.log('drew pie')

  if (options.embedData) {
    console.log('embed data into element: ' + options.embedData)
    d3Svg.embedData(data, options.embedData)
  }

  return {records: data.length, max: set.maxValue }
}

function addLabels (options) {
  var set = d3Svg.setOptions('pie', options)  // uses bar options for spacing 
  var svg = options.svg
  var data = options.data

  var labelPos = options.labelPos
  if (set.labelPosition === 'outside' ) {
    labelPos = options.radius + set.spacing
  } else if (set.labelPosition === 'inside') {
    labelPos = options.radius * 0.65
  } else if (set.labelPosition === 'legend') {
    labelPos = set.width / 10
  }

  const color = set.color;
  var colours = set.colours || data.map((a,i) => color(i));

  const arcLabel = d3.arc()
    .innerRadius(labelPos)
    .outerRadius(labelPos)

  var xPos = arcLabel.centroid(60)
  console.log('test pos: ' + JSON.stringify(xPos))

  var pie = d3.pie()
    .value(function(d) { return d[set.valueCol] });

  // Add Labels
  const labels = svg
    .selectAll('.myLabels')
    .data(pie(data))
    .enter()
    .append('text')
    .style('font-size', set.fontSize + 'px')
    .style('font-weight', 'bold')

  var bgcolour = 'white'; // CONSTRUCTION - enable svg background specification (?)
  var bgcolours = data.map((a,i) => bgcolour);   // default to svg background unless labels 'inside'
  if (set.labelPosition === 'outside' ) {
    labels.style('text-anchor', function(d) {
      // are we past the center?
      return (d.endAngle + d.startAngle)/2 > Math.PI ?
          "end" : "start";
    })
    .attr('transform', d => `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize})`)

  } else if (set.labelPosition === 'inside') {
    labels.style('text-anchor','middle')
    .attr('transform', d => `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize})`)

    bgcolours = set.colours || data.map((a,i) => color(i)); // specify background colours so that text colour may provide contrast
  } else if (set.labelPosition === 'legend') {
    labels.style('text-anchor','start')
    .attr('transform', (d, i) => "translate(" + (labelPos + set.fontSize * 2) + "," + (labelPos + i*set.fontSize*2) + ")")
  }

  if (options.rotateLabels) {
    labels
      .attr('transform', d => {
        return (d.endAngle + d.startAngle)/2 > Math.PI ?
          `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize}), rotate(${(d.startAngle + d.endAngle)/2 * 180 / Math.PI + 90})` :
          `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize}), rotate(${(d.startAngle + d.endAngle)/2 * 180 / Math.PI - 90})`
      })
  }

  labels.style('alignment-baseline', 'middle')

  labels.append('tspan')
    .attr('y', '-0.6em')
    .attr('x', 0)
    .style('fill', (d,i) => d3Svg.contrastWith(bgcolours[i]))
    .text((d,i) => `${data[i][set.labelCol]}`)

  if (set.labelPosition === 'legend') {
    svg.selectAll(".myLegend")
      .data(data)
      .enter()
      .append("rect")
        .attr('id', (d) => `${"Legend" + d[set.labelCol]}`)
        .attr('x', labelPos)
        .attr('y', (d,i) => `${labelPos + i*set.fontSize*2 - set.fontSize - set.fontSize/2}` )  // - 23
        .attr('height', set.fontSize)
        .attr('width', set.fontSize)
        .attr('fill', (d, i) => colours[i])
  }

  return {options: options, valueColumn: set.valueCol, labelColumn: set.labelCol }
}

function addPetals (options) {
  // Add input petals = { outerRadius: , column: , colour }
  console.log('add petals to pie chart: ' + JSON.stringify(options));
  var svg = options.svg || this.initSvg(options);
  var data = options.data; // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]

  const set = d3Svg.setOptions('pie', options);

  var petalRadius = options.petals.outerRadius || set.radius * 1.5
  var labelRadius = options.petals.labelRadius || set.radius * 1.2
  var petalLabelCol  = options.petals.column
  var petalColour = options.petals.colour
  var petalColours = options.petals.colours || data.map(a => [])

  var centre = [set.width / 2, set.height/ 2]

  var pie = d3.pie().value(function (d) {
    return d[set.valueCol];
  });

  var labelAngles = []
  const petals = svg.selectAll('.myPetals').data(pie(data)).enter().append('text');

  petals.attr('angle', function (d) {
    var midAngle = (d.startAngle + d.endAngle) / 2

    var details = {
      start: d.startAngle, 
      end: d.endAngle, 
      x: centre[0] + d3.arc().innerRadius(set.radius).outerRadius(set.radius).startAngle(d.startAngle).endAngle(d.startAngle).centroid(d)[0], 
      y: centre[1] + d3.arc().innerRadius(set.radius).outerRadius(set.radius).startAngle(d.startAngle).endAngle(d.startAngle).centroid(d)[1],
      tipX: centre[0] + d3.arc().innerRadius(petalRadius).outerRadius(petalRadius).startAngle(midAngle).endAngle(midAngle).centroid(d)[0],
      tipY: centre[1] + d3.arc().innerRadius(petalRadius).outerRadius(petalRadius).startAngle(midAngle).endAngle(midAngle).centroid(d)[1],
      midAngle: midAngle * 180 / Math.PI
    }

    if (petalLabelCol) {
      details.label = d.data[petalLabelCol]
    }
    
    labelAngles.push(details)

    console.log(petalLabelCol + ' ==== ' + d.data.label + ' FROM ' + JSON.stringify(d.data))
    return d.startAngle
  })
  console.log('Angles: ' + JSON.stringify(labelAngles))

  var Gen = d3.line() 
  .x((d) => parseFloat(d.x)) 
  .y((d) => parseFloat(d.y)) 

  Gen.curve(d3.curveBasis); 

  for (var i = 0; i < labelAngles.length; i++) {
    var curves = [{x: labelAngles[i].x, y: labelAngles[i].y}]

    curves.push({x: labelAngles[i].tipX, y: labelAngles[i].tipY})

    if (i === labelAngles.length - 1) {
      curves.push({x: labelAngles[0].x, y: labelAngles[0].y})
    } else {
      curves.push({x: labelAngles[i+1].x, y: labelAngles[i+1].y})
    }

    svg
      .append("path") 
      .attr("d", Gen(curves)) 
      .attr("fill", petalColour || petalColours[i] || 'none')
      .attr("stroke", 'black')         

    console.log("add curve " + i + ': ' + JSON.stringify(curves))
  }

  if (petalLabelCol) {
    const petalLabel = d3.arc()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius)

    var pie = d3.pie()
      .value(function(d) { return d[set.valueCol] });

    // Add Labels
    const petalLabels = svg
      .selectAll('.petalLabels')
      .data(pie(data))
      .enter()
      .append('text')
      .style('font-size', set.fontSize + 'px')

    petalLabels.style('text-anchor', 'middle')
    // function(d) {
    //   // are we past the center?
    //   return (d.endAngle + d.startAngle)/2 > Math.PI ?
    //       "end" : "start";
    // })
    .attr('transform', d => `translate(${petalLabel.centroid(d)[0] + set.width/2}, ${petalLabel.centroid(d)[1] + set.height/2 })`)

    if (options.petals.rotate) {
      petalLabels
        .attr('transform', d => {
          return (d.endAngle + d.startAngle)/2 > Math.PI ?
            `translate(${petalLabel.centroid(d)[0] + set.width/2}, ${petalLabel.centroid(d)[1] + set.height/2}) rotate(${(d.startAngle + d.endAngle)/2 * 180 / Math.PI + 90})` :
            `translate(${petalLabel.centroid(d)[0] + set.width/2}, ${petalLabel.centroid(d)[1] + set.height/2}) rotate(${(d.startAngle + d.endAngle)/2 * 180 / Math.PI - 90})`
        })
    }

    petalLabels.style('alignment-baseline', 'middle')

    petalLabels.append('tspan')
      .attr('y', '-0.6em')
      .attr('x', 0)
      .style('font-weight', 'bold')
      .style('font-size', set.fontSize + 'px')
      .text((d,i) => `${data[i][petalLabelCol]}`)
  }
}

  function addArcs (options) {    
    console.log('add pie chart: ' + JSON.stringify(options))
    var svg = options.svg || this.initSvg(options)
    var data = options.data       // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]
  
    const set = d3Svg.setOptions('pie', options)
    console.log('default settings: ' + JSON.stringify(set))
  
    var arcWidth = (set.outerRadius - set.innerRadius) / data.length

    const angleScale = d3
      .scaleLinear()
      .domain([0, set.maxValue])
      .range([0, 1.5 * Math.PI]);

    const arc = d3.arc()
      .innerRadius((d, i) => (i + 1) * set.arcWidth + set.innerRadius)
      .outerRadius((d, i) => (i + 2) * set.arcWidth + set.innerRadius)
      .startAngle(angleScale(0))
      .endAngle(d => angleScale(d[set.yAxis]));

    console.log('width of arc: ' + arcWidth)

    var drawing = svg.append('g')
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colours[i])
        .attr("stroke", set.stroke)
        .attr("stroke-ypos", "1px")
        .on("mouseenter", function(d) {
          // d3.select(this)
          //   .transition()
          //   .duration(200)
          //   .attr("opacity", 0.5)
          d3.select('#Legend' + d[set.labelCol])
            .selectAll('rect')
            .transition()
            .duration(200)
            .attr("opacity", 0.5)
        })
        .on("mouseout", function(d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1);
          d3.select('#Legend' + d[set.labelCol])
            .transition()
            .duration(200)
            .attr("opacity", 1)
        });
    
    // g.selectAll("text")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //       .style('font-size', fontSize + 'px')
    //       .text(d => `${d[xAxis]} : ${d[yAxis]}`)
    //       .attr("x", -150)
    //       .attr("dy", -inner - arcWidth/2)
    //       .attr("y", (d, i) => -(i + 1) * arcWidth);

    drawing.attr("transform", `translate(200, 200)`);

    console.log('drew arcs')
    return {options: options}
  }

  export default { checkDefaults, addPie, addArcs, addLabels, addPetals };
