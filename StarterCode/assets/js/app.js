// @TODO: YOUR CODE HERE!
// Step 1: Set up our chart
//= ================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 70,
  left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3
  .selected("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Setting up data

var selectedXAxis = "poverty";
var selectedYAxis = "healthcare";

//Function to update x-scale upon selectedion
function xScale(data, selectedXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedXAxis]) * 0.8,
            d3.max(data, d => d[selectedXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
};

//Function to update y-scale upon selectedion
function yScale(data, selectedYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedYAxis]) * 0.8,
            d3.max(data, d => d[selectedYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
};

//Function to update othrerx-axis upon selectedion
function setXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

//Function to update othery-axis upon selectedion
function setYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
//Function to update circles group upon selectedion
function setCircles(circlesGroup, newXScale, selectedXAxis, newYScale, selectedYAxis) {
    circlesGroup.transition()
        .duration(100)
        .attr("cx", d => newXScale(d[selectedXAxis]))
        .attr("cy", d => newYScale(d[selectedYAxis]))
    
        return circlesGroup;
}

//Function to update circle text group upon selectedion
function setCircleText(circlesText, newXScale, selectedXAxis, newYScale, selectedYAxis) {
    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[selectedXAxis]))
        .attr("y", d => newYScale(d[selectedYAxis]))
    return circlesText;
}

//Function to update the circles with the tooltip
function setToolTip(selectedXAxis, circlesGroup, selectedYAxis) {
    let label;
    let unit;

    if(selectedXAxis === "poverty") {
        label = "Poverty: " 
        unit = "%"
    }
    else if(selectedXAxis === "age") {
        label = "Age: "
        unit = " yrs"
    }
    else {
        label = "Household Income: $"
        unit = "$"
    }

    if(selectedYAxis === "healthcare") {
        yLabel = "Lack Healthcare: " 
        yUnit = "%"
    }
    else if(selectedYAxis === "smokes") {
        yLabel = "Smoke: "
        yUnit = "%"
    }
    else {
        yLabel = "Obesity"
        yUnit = "%"
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -80])
        .html(function(d) {
            return(`<strong>${d.state}</strong><br>${label}${d[selectedXAxis]}${unit}<br>${yLabel}${d.healthcare}${yUnit}`);
        });
    
    chartGroup.call(toolTip);

    circlesGroup
        .on("mouseover", function(d) {toolTip.show(d, this);
        })
        .on("mouseout", function(data){toolTip.hide(data);
        });
    return circlesGroup;
}

//Import Data from data.CSV

d3.csv("./assets/data/data.csv").then(function(data, err) {
        if (err) throw err;


    data.forEach(data => {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    var xLinearScale = xScale(data, selectedXAxis);
    
    var yLinearScale = yScale(data, selectedYAxis);
    
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    //Append axes to chart
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
        
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
        
    //Create circles for scatter plot
    var circlesGroup = chartGroup.selectedAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", data => xLinearScale(data.poverty))
        .attr("cy", data => yLinearScale(data.healthcare))
        .attr("r", "10")
        .attr("fill", "blue")
        .attr("opacity", "0.75")
        
    //Label circles on scatter plot
    var circlesText = chartGroup.selectedAll()
        .data(data)
        .enter()
        .append("text")
        .text(d => (d.abbr))
        .attr("x", data=> xLinearScale(data.poverty))
        .attr("y", data => yLinearScale(data.healthcare))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
            
    //Making tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return(`${data.state}<br>Poverty: ${data.poverty}%<br>Lacks Healthcare: ${d.healthcare}`);
        });
    
    //Create tooltip in chart
    chartGroup.call(toolTip);

    circlesGroup
    .on("mouseover", function(d) {toolTip.show(d, this);
    })
    .on("mouseout", d => {toolTip.hide(d, this);
})

     //Append and create y axis label group
    var yLabelGroup = chartGroup.append("g")
    .attr("transform", `translate(-35, ${height/2})`)
    .attr("class", "axisText")
     
    var healthcareLabel = yLabelGroup.append("text")   
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "healthcare")
    .attr("transform", "rotate(-90)")
    .classed("active", true)
    .text("Lack Healthcare (%)");
 
    var smokeLabel = yLabelGroup.append("text")   
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "smokes")
    .attr("transform", "rotate(-90)")
    .classed("inactive", true)
     .text("Smokes (%)");
 
    var obeseLabel = yLabelGroup.append("text")   
     .attr("x", 0)
    .attr("y", -40)
    .attr("value", "obesity")
    .attr("transform", "rotate(-90)")
    .classed("inactive", true)
    .text("Obese (%)");
 
    //Append and create x axis label group
    var xLabelGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
    .attr("class", "axisText")

    var povertyLabel = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");
 
    var ageLabel = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");
    
//Update ToolTip
    var circlesGroup = setToolTip(selectedXAxis, circlesGroup, selectedYAxis);

});

