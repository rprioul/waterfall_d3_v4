const margin = {top: 20, right: 30, bottom: 30, left: 40};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const padding = 0.3;

const x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(padding);

const y = d3.scaleLinear()
    .range([height, 0]);

const xAxis = d3.axisBottom(x);

const yAxis = d3.axisLeft(y)
    .tickFormat((d) => {
      return d;
    });

const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const chart = d3.select('.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${ margin.left },${ margin.top })`);

// Based on color scale found on colorbrewer2.org
const colors = d3.scaleLinear()
    .range(["#fed976", "#bd0026"])
    .interpolate(d3.interpolateHcl);

let total = 0;

const type = (d) => {
  d.value = +d.value;
  return d;
}; // type

const drawWaterfall = (data) => {
  x.domain(data.map((d) => {
    return d.stage;
  }));

  y.domain([
    0,
    d3.max(data, (d) => {
      return d.end;
    })
  ]);

  chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${ height })`)
      .call(xAxis);

  chart.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

  let bar = chart.selectAll('.bar')
      .data(data)
    .enter().append('g')
      .attr('class', (d) => {
        return `bar ${ d.class }`
      })
      .attr('transform', (d) => {
        return `translate(${ x(d.stage) },0)`;
      })
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(`${ (100 * Math.abs(d.end - d.start) / total).toPrecision(3) }%`)
         .style("left", (d3.event.pageX) + "px")
         .style("top", (d3.event.pageY) + "px");
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

  bar.append('rect')
      .attr('y', (d) => {
        return y( Math.max(d.start, d.end) );
      })
      .attr('height', (d) => {
        return Math.abs( y(d.start) - y(d.end) );
      })
      .attr('width', x.bandwidth())
      .style('fill', (d, i) => {
        return colors(i / data.length);
      })
      .on("mouseover", function() {
        d3.select(this).style("opacity", 0.7)
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 1)
      });

  // Add the value on each bar
  bar.append('text')
      .attr('x', x.bandwidth() / 2)
      .attr('y', (d) => {
        return d.class === 'negative' ? y(d.start) : y(d.end);
      })
      .attr('dy', '-.5em')
      .text((d) => {
        return Math.abs(d.end - d.start);
      })
      .style('fill', 'black');

  // Add the connecting line between each bar
  bar.append('line')
      .attr('class', 'connector')
      .attr('x1', x.bandwidth() + 5 )
      .attr('y1', (d) => {
        return y(d.end);
      })
      .attr('x2', x.bandwidth() / (1 - padding) - 5)
      .attr('y2', (d) => {
        return y(d.end);
      });
} // drawWaterfall

const prepData = (data) => {
  // create stacked remainder
  const insertStackedRemainderBefore = (dataStage, newDataStage) => {
    const index = data.findIndex((datum) => {
      return datum.stage === dataStage;
    }); // data.findIndex

    return data.splice(index, 0, {
      stage: newDataStage,
      start: 0,
      end: data[index].start,
      class: 'positive',
    }); // data.splice
  } // insertStackedRemainder

  // retrieve total value
  let cumulative = data.reduce((p,c) => {
    return p + c.value;
  }, 0); // data.reduce

  total = cumulative;

  // Transform data (i.e., finding cumulative values and total) for easier charting
  data.map((datum) => {
    datum.start = cumulative;
    cumulative -= datum.value;
    datum.end = cumulative;
    datum.class = 'negative';
  }); // data.map

  // insert stacked remainders where approriate
  insertStackedRemainderBefore('New visitors', 'Total');
  insertStackedRemainderBefore('Non leads', 'Return visitors');

  drawWaterfall(data);
} // prepData

d3.csv('data.csv', type, (error, data) => {
  return prepData(data);
});
