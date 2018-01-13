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
      return dollarFormatter(d);
    });

const chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${ margin.left },${ margin.top })`);

const type = (d) => {
  d.value = +d.value;
  return d;
}

const dollarFormatter = (n) => {
  n = Math.round(n);
  if (Math.abs(n) > 1000) return `$${ Math.round(n/1000) }K`;
  if (Math.abs(n) > 1000000) return `$${ Math.round(n/1000000) }M`;
  else return `$${ n }`;
}

const prepData = (data) => {
  // create stacked remainder
  const insertStackedRemainderBefore = (barName, newBarName) => {
    const index = data.findIndex((datum) => {
      return datum.name === barName;
    }); // data.findIndex

    return data.splice(index, 0, {
      name: newBarName,
      start: 0,
      end: data[index].start,
      class: 'positive',
    }); // data.splice
  } // insertStackedRemainder


  // Transform data (i.e., finding cumulative values and total) for easier charting
  let cumulative = 0;

  data.map((datum) => {
    datum.start = cumulative;
    cumulative += datum.value;
    datum.end = cumulative;

    return datum.class = ( datum.value >= 0 ) ? 'positive' : 'negative';
  }); // data.map

  data.push({
    name: 'Total',
    end: cumulative,
    start: 0,
    class: 'total'
  });

  // Add a stacked remainder to display as example
  insertStackedRemainderBefore('Fixed Costs', 'Total Revenue')

  return drawWaterfall(data);
} // prepData

const drawWaterfall = (data) => {
  x.domain(data.map((d) => {
    return d.name; 
  }));

  y.domain([
    0,
    d3.max(data, (d) => {
      return d.end;
    })
  ]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${ height })`)
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  const bar = chart.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", (d) => {
        return `bar ${ d.class }`;
      })
      .attr("transform", (d) => {
        return `translate(${ x(d.name) },0)`;
      });

  bar.append("rect")
      .attr("y", (d) => {
        return y( Math.max(d.start, d.end) );
      })
      .attr("height", (d) => {
        return Math.abs( y(d.start) - y(d.end) );
      })
      .attr("width", x.bandwidth());

  bar.append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d) => {
        return y(d.end) + 5;
      })
      .attr("dy", (d) => {
        return ((d.class=='negative') ? '-' : '') + ".75em"
      })
      .text((d) => {
        return dollarFormatter(d.end - d.start);
      });

  bar.filter((d) => {
    return d.class != "total" }).append("line")
      .attr("class", "connector")
      .attr("x1", x.bandwidth() + 5 )
      .attr("y1", (d) => {
        return y(d.end);
      })
      .attr("x2", x.bandwidth() / ( 1 - padding) - 5 )
      .attr("y2", (d) => {
        return y(d.end);
      });
}

d3.csv("data.csv", type, (error, data) => {
  return prepData(data);
});