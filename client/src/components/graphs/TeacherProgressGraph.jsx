import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TeacherProgressGraph = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 250 };
    const width = 900 - margin.left - margin.right;
    const height = Math.max(300, data.length * 50) - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.3);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '%'))
      .style('font-size', '12px');

    // Add Y axis with teacher names
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-size', '12px');

    // Add the bars
    const bars = svg.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    // Background bars
    bars.append('rect')
      .attr('class', 'bar-bg')
      .attr('y', d => yScale(d.name))
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', width)
      .attr('fill', '#f3f4f6');

    // Progress bars (red for 0%)
    bars.append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.name))
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(0)) // All at 0% initially
      .attr('fill', '#dc2626')
      .attr('rx', 4)
      .attr('ry', 4);

    // Add total lectures text
    bars.append('text')
      .attr('x', width + 10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text(d => `${d.completedLectures}/${d.totalLectures} lectures`)
      .style('font-size', '12px')
      .style('fill', '#6b7280');

    // Add percentage text
    bars.append('text')
      .attr('x', 5)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text('0%')
      .style('font-size', '12px')
      .style('fill', '#4b5563');

  }, [data]);

  return (
    <div className="relative overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TeacherProgressGraph;
