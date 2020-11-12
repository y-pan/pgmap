import React from 'react';
import { ColumnItem, ConstraintItem, TableItem, TableTypes } from '../../api/type';
import * as d3 from 'd3';
import { compare, groupBy, SMap, toDistinctMap } from '../../api/Utils';

interface Props {
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

const fontSize = 15; // For "flyway_schema_history" fontSize 15 -> 116px w * 18px h
const ch = 20; // cell height 
const cw = 300; // cell width 
const tableVSpace = 15, tableHSpace = 15;

interface XY {
  x: number;
  y: number;
}

interface WH {
  w: number;
  h: number;
}

interface TableDrawData extends XY, WH {
  type: TableTypes;
  name: string;
  columns: ColumnItem[]; // columns of the table
}

/** @summary returns array of [w, h] */
function tableSize(size: number): {w: number, h: number} {
  return { w: cw, h: ch * size + 1}; // 1 is for table_name itself
}

interface ColumnDrawData extends ColumnItem, XY, WH {
  // column need to know its constraint type(s)
}

interface ConstraintDrawData extends ConstraintItem {
  // connect all column points when hover/double-click   
  // constraint need to know where column(s) located, for
}

function draw(
  svgDom: SVGElement, 
  tables: TableItem[], 
  columns: ColumnItem[], 
  constraints: ConstraintItem[]) { 
    if (!svgDom || !tables || !columns) {
      console.warn("Cannot draw!");
      return;
    }

    // sort by type asc, name asc, 
    tables.sort((t1, t2) => {
      let compType = compare(t1.table_type, t2.table_type);
      if (compType !== 0) return compType;
      return compare(t1.table_name, t2.table_name);
    });

    const svgW = window.innerWidth - 20;

    let cursorX = 0, cursorY = 0, cursorH = 0;
    const tableNameToColumnsMap: SMap<ColumnItem[]> = groupBy<ColumnItem, ColumnItem>(columns, column => column.table_name);
    const tablesData: TableDrawData[] = [];
    for (let tableItem of tables) {
      const tableCols = tableNameToColumnsMap[tableItem.table_name];
      const {w, h} = tableSize(tableCols.length);
      
      if (cursorX + w < svgW) {
        // keep append table to the right, on same row
        tablesData.push(
          {name: tableItem.table_name, type: tableItem.table_type, columns: tableCols, x: cursorX, y: cursorY, w, h}
        );
        cursorX = cursorX + w + tableHSpace;
        cursorH = Math.max(cursorH, h);
      } else {
        // new line
        cursorX = 0;
        cursorY += Math.max(cursorH, h) + tableVSpace;
        cursorH = h;
        tablesData.push(
          {name: tableItem.table_name, type: tableItem.table_type, columns: tableCols, x: cursorX, y: cursorY, w, h}
        )
        cursorX += w + tableHSpace;
      }
    }

    const tableNameToXYMap: SMap<XY> = toDistinctMap<TableDrawData, XY>(
      tablesData, 
      td => td.name, 
      td => ({x: td.x, y: td.y})
    );
    
    const tableNameToConstraintsMap: SMap<ConstraintItem[]> = groupBy<ConstraintItem, ConstraintItem>(
      constraints, 
      constraint => constraint.table_name
      // constraint => constraint.
      );
    
    // draw
    const svg = d3.select(svgDom)
    .attr("width", svgW)
    .attr("height", cursorY + cursorH);

    // Clean up everything. 
    svg.selectAll('g').remove();

    // tables
    const gTable = svg.append('g')
    .classed("g-table", true);
    // - tables: boxs
    gTable.selectAll('rect.table')
    .data(tablesData) //, function(d) {return (d as any).name;})
    .enter().append('rect')
    // .join('rect')
    .classed("table", true)
    .classed('table-view', d => d.type === TableTypes.VIEW)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.w)
    .attr('height', d => d.h)
    ;

    // - table: names
    gTable
    .selectAll('rect.table-name')
    .data(tablesData) //, function(d) {return (d as any).name;})
    .join('rect')
    .classed("table-name", true)
    .classed('table-view', d => d.type === TableTypes.VIEW)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.w)
    .attr('height', ch);

    gTable
    .selectAll('text.table-name')
    .data(tablesData) //, function(d) {return (d as any).name;})
    .join('text')
    .classed("table-name", true)
    .classed('table-view', d => d.type === TableTypes.VIEW)
    .attr('x', d => d.x + cw/2)
    .attr('y', d => d.y + fontSize)
    .text(d => d.name);

    // columns
    const gColumnOuter = svg.append('g')
    .classed("g-column-outer", true)
    .attr('transform', `translate(0, ${ch})`);

    gColumnOuter.selectAll("text.column-name")
    .data(columns)
    .join('text')
    .classed('column-name', true)
    .attr('x', d => {
      const xy: XY = tableNameToXYMap[d.table_name];
      if (!xy) {
        // This column might be from a table view, and which is not fetched in tables;
        console.log(`Table ${d.table_name} not found for column ${d.column_name}, in schema ${d.table_schema}. Make sure query criteria compatible for table and column.`);
        return -1000; //0 + cw / 2;
      }
      return xy.x + cw / 2;
    })
    .attr('y', (d, index) => {
      const xy: XY = tableNameToXYMap[d.table_name]
      if (!xy) {
        // This column might be from a table view, and which is not fetched in tables;
        console.log(`Table ${d.table_name} not found for column ${d.column_name}, in schema ${d.table_schema}. Make sure query criteria compatible for table and column.`);
        return -1000;
      }
      return xy.y + d.ordinal_position * fontSize;
    })
    .text(d => {
      const colConstrs: ConstraintItem[] = tableNameToConstraintsMap[d.table_name];
      if (!colConstrs || colConstrs.length === 0) return d.column_name;
      // get all constraints
      let conTyps = []
      for (let con of colConstrs) {
        let indexes = con.columns_index;
        if (indexes && indexes.includes(d.ordinal_position)) {
          conTyps.push(con.constraint_type);
        } 
      }
      if (conTyps.length === 0) return d.column_name;
      let conTypeStr = conTyps.join(",")
      return `${d.column_name} [${conTypeStr}]` 
    });
    
    // const gColumnInner = gColumnOuter
    // .selectAll('g.g-column-inner')
    // .data(tablesData)
    // .join('g')
    // .classed("g-column-inner", true)
    // .attr('x', d => d.x)
    // .attr('y', d => d.y + ch)
    // .attr("width", cw)
    // .attr("height", ch);

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