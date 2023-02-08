# pie-chart-d3

# Package for Easily Plotting Pie Charts using D3

# Basic Usage:

- `npm install -S pie-chart-d3 svg-d3`

- import in code
  - `import 'd3Pie from 'pie-chart-d3'`

- Add canvas element to html page (d3Canvas is the default id expected)
  - `<div id='#d3Canvas' />`

- Call addPie
  - `const data_example = [
                            {country: 'USA', gdp: 20.8}, 
                            {country: 'China', gdp: 14.9}, 
                            {country: 'Japan', gdp: 4.9}, 
                            {country: 'Germany', gdp: 3.8}, 
                            {country: 'France', gdp: 2.6}
                          ]`
  - `d3Pie.addPie({data: data})`

  # Options:

- define svg explicitly 
  - (enables layering by re-using existing svg element)
  - `import 'd3Svg from 'svg-d3'`
  - ...
  - `var svg = d3Svg.initSvg({clear: 'true'})`
  - `d3Pie({svg: svg, data: data})`

- specify canvas size (defaults to 900 x 600)
  - (automatically adjusts size to fit canvas)
  - `d3Pie({data: data, canvasHeight: 500, canvasWidth: 800})`

- specify orientation (defaults to vertical Pie chart)
  - (automatically adjusts size to fit canvas)
  - `d3Pie({data: data, orientation: "horizontal"})`

- specify axis labels
  - (automatically adjusts size to fit canvas)
  - `d3Pie({data: data, xaxis: 'Country', yaxis: 'GDP ($USD in millions)'})`

- specify scale
  - (overrides auto-scaling that fits plot to canvas size)
  - `d3Pie({data: data, scale: 10})`

- check default settings
  - `var defaults = d3Pie.checkDefaults()`
  - this allows you to check values like 'scale', 'maxValue' etc. if you have customized the canvas size and/or scaling
  - `var defaults = d3Pie.checkDefaults({data: data, scale: 10, canvasHeight: 500, canvasWidth: 800})`

- embed data table in page
  - add empty element in html
  - `<div#embedDataHere />`
    - `d3Pie.addPie({data: data, embedData: "embedDataHere"})`

- specify position for labels ('inside', 'outside' (perimiter), 'legend' (default))
  - `d3Pie.addPie({data: data, labelPosition: 'outside')