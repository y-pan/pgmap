import React from 'react';
import { ColumnItem, ConstraintItem, TableItem } from '../../api/type';
import * as d3 from 'd3';
import { groupBy, SMap } from '../../api/Utils';

interface Props {
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

const ch = 10; // cell height 
const cw = 200; // cell width 
const fontSize = 15; // For "flyway_schema_history" fontSize 15 -> 116px w * 18px h
const tableVSpace = 15, tableHSpace = 15;

interface TableDrawData {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  columns: ColumnItem[]; // columns of the table
}

/** @summary returns array of [w, h] */
function tableSize(size: number): {w: number, h: number} {
  return { w: cw, h: ch * size + 1}; // 1 is for table_name itself
}

function draw(
  svg: SVGElement, 
  tables: TableItem[], 
  columns: ColumnItem[],
  constraints: ConstraintItem[]) {
    if (!svg || !tables || !columns) {
      console.warn("Cannot draw!");
      return;
    }
    // svg.clientWidth 
    const svgBoundigRect = svg.getBoundingClientRect();
    console.log("svg box", svgBoundigRect);
    const svgW = Math.max(window.innerWidth, svgBoundigRect.width) - 20;

    let cursorX = 0, cursorY = 0, cursorH = 0;
    const tableNameToColumnsMap: SMap<ColumnItem[]> = groupBy<ColumnItem>(columns, column => column.table_name);

    const tablesData: TableDrawData[] = [];
    for (let tableItem of tables) {
      const tableCols = tableNameToColumnsMap[tableItem.table_name];
      const {w, h} = tableSize(tableCols.length);
      
      if (cursorX + w < svgW) {
        // keep append table to the right, on same row
        tablesData.push(
          {name: tableItem.table_name, columns: tableCols, x: cursorX, y: cursorY, w, h}
        );
        cursorX = cursorX + w + tableHSpace;
        cursorH = Math.max(cursorH, h);
      } else {
        // new line
        cursorX = 0;
        cursorY += Math.max(cursorH, h) + tableVSpace;
        cursorH = h;
        tablesData.push(
          {name: tableItem.table_name, columns: tableCols, x: cursorX, y: cursorY, w, h}
        )
        cursorX += w + tableHSpace;
      }
    }
    
    d3.select(svg)
    .attr("width", svgW)
    .attr("height", cursorY + cursorH)
    .append('g')
    .selectAll('rect.table')
    .data(tablesData)
    .enter().append('rect')
    .classed("table", true)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.w)
    .attr('height', d => d.h)
    ;

    // d3.select(svg).append("rect")
    // .attr("x", 0)
    // .attr("y", 0)
    // .attr("width", cw)
    // .attr("height", 25)
    // ;
    // d3.select(svg).append("text").text("flyway_schema_history")
    // .attr("x", cw/2)
    // .attr("y", 20)
    // .attr("font-size", 15)
    // .attr("fill", "red")
    // .attr("text-anchor", "middle")
    // ;
  
    // d3.select(svg)
    // .append("rect")
    // .attr("x", 0)
    // .attr("y", 0)
    // .attr("height", 10)
    // .attr("width", 50);

  }

const SvgMap: React.FC<Props> = ({tables, columns, constraints}) => {
  return <svg className="schema-svg-map" ref={ref => ref && draw(ref, tables, columns, constraints)}/>
}

export default SvgMap;