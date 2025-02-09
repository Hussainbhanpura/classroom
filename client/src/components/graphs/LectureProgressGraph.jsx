import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LectureProgressGraph = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.lectureCount)])
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.lectureCount))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-size', '12px');

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Number of Lectures');

    // Add the line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.date)))
      .attr('cy', d => yScale(d.lectureCount))
      .attr('r', 4)
      .attr('fill', '#4f46e5')
      .on('mouseover', function(event, d) {
        const tooltip = d3.select('.tooltip');
        tooltip.style('visibility', 'visible')
          .html(`Date: ${new Date(d.date).toLocaleDateString()}<br/>Lectures: ${d.lectureCount}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
        d3.select(this).attr('r', 6);
      })
      .on('mouseout', function() {
        d3.select('.tooltip').style('visibility', 'hidden');
        d3.select(this).attr('r', 4);
      });

  }, [data]);

  return (
    <div className="relative">
      <div className="tooltip absolute bg-black text-white p-2 rounded text-sm pointer-events-none" 
           style={{ visibility: 'hidden' }}>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LectureProgressGraph;
