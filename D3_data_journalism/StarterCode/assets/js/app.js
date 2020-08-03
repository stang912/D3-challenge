
// function to resize chart
function makeChart() {
    
  var svgWidth = 1000;
  var svgHeight = 600;

  // set margins
  var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
  };
  
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // create an SVG Element/Wrapper
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append Group Element & Set Margins
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // updating xScale on Axis Label
  function xScale(acsData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
        d3.max(acsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }

  // updating yScale on Axis Label
  function yScale(acsData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
        d3.max(acsData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
    return yLinearScale;
  }

  // updating xAxis on Axis Label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

  // updating yAxis on Axis Label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

  // transition to new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  // transition to new text group
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");
    return textGroup;
  }

  // updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    if (chosenXAxis === "poverty") {
      var xLabel = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
      var xLabel = "Age (Median)";
    }
    else {
      var xLabel = "Household Income (Median)";
    }
    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "Obese (%)";
    }
    else {
      var yLabel = "Smokes (%)";
    }

    // initialize Tool Tip
    var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([90, 90])
      .html(function(d) {
        return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });

    // tooltip in the circles group
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    // Create Text Tooltip in the Chart
    textGroup.call(toolTip);
  
    textGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    return circlesGroup;
  }

  // import data
  d3.csv("assets/data/data.csv")
    .then(function(acsData) {

    // format data
    acsData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    var xLinearScale = xScale(acsData, chosenXAxis);
    var yLinearScale = yScale(acsData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append xAxis to the chart
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append yAxis to the chart
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // create & append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(acsData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateCircle")
      .attr("r", 15)
      .attr("opacity", ".75");

    // append text to circles
    var textGroup = chartGroup.selectAll(".stateText")
      .data(acsData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
      .text(d => (d.abbr))
      .attr("class", "stateText")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

    // create group for 3 xAxis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") 
      .classed("active", true)
      .text("Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Household Income (Median)");

    // create group for 3 yAxis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(-25, ${height / 2})`);
  
    var healthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", 0)
      .attr("value", "healthcare")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text") 
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", 0)
      .attr("value", "smokes")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", 0)
      .attr("value", "obesity")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

    // xAxis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
          chosenXAxis = value;
          xLinearScale = xScale(acsData, chosenXAxis);
          xAxis = renderXAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)          
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
   
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    
      // yAxis labels event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
          chosenYAxis = value;
          yLinearScale = yScale(acsData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });
}

makeChart();

d3.select(window).on("resize", makeChart);