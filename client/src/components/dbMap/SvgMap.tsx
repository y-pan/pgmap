import React from 'react';
import { ColumnItem, ConstraintItem, ConstraintTypes, TableItem, TableTypes } from '../../api/type';
import * as d3 from 'd3';
import { groupBy, SMap, toDistinctMap } from '../../api/Utils';
import { setFocusTableSaga, setQuerySucceeded } from '../../store/actions/tables';
import { useDispatch } from 'react-redux';

interface Props {
  schema: string,
  focusTable?: string;
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

const fontSize = 15; // For "flyway_schema_history" fontSize 15 -> 116px w * 18px h
const ch = 20; // cell height 
const cw = 500; // cell width 
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
  columns_name: string[];
  ref_columns_name: string[];
}

function draw(
  svgDom: SVGElement, 
  schema: string,
  focusTable: string | undefined,
  tables: TableItem[], 
  columns: ColumnItem[], 
  constraints: ConstraintItem[],
  setFocusTable: (table: string) => any,
  setQuery: (query: string) => void) { 
    if (!svgDom || !tables || !columns) {
      console.warn("Cannot draw!");
      return;
    }
    const svgW = Math.max(800, window.innerWidth - 300);

    // ********* prepare data *************
    // sort by type asc, name asc, backend already sorted nicely
    // tables.sort((t1, t2) => {
    //   let compType = compare(t1.table_type, t2.table_type);
    //   if (compType !== 0) return compType;
    //   return compare(t1.table_name, t2.table_name);
    // });
    
    const tableNameToConstraintsMap: SMap<ConstraintItem[]> = groupBy<ConstraintItem, ConstraintItem>(
      constraints, 
      constraint => constraint.table_name
      // constraint => constraint.
      );

    let targetTables: TableItem[] = [];
    if (!focusTable) {
      targetTables = tables;
    } else {
      // only display on tables having relationship with the "focusTable"

      const refTables: Set<string> = new Set();
      const focusConstrs = tableNameToConstraintsMap[focusTable];
      for (let constr of focusConstrs) {
        constr.ref_table_name && refTables.add(constr.ref_table_name);
      }
      
      for (let table of tables) {
        if (table.table_name === focusTable) {
          targetTables.unshift(table);
        }
        if (refTables.has(table.table_name)) {
          targetTables.push(table);
        }
      }
      
    }

    let cursorX = 0, cursorY = 0, cursorH = 0;
    const tableNameToColumnsMap: SMap<ColumnItem[]> = groupBy<ColumnItem, ColumnItem>(columns, column => column.table_name);
    const tablesData: TableDrawData[] = [];
    for (let tableItem of targetTables) {
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
    
    // focusTable, targetTables, 
    function columnOrdinalsToNames(table: string, oridnals: number[]): string[] {
      if (!table || !oridnals || oridnals.length === 0) return [];
      const tableColumns = tableNameToColumnsMap[table];
      if (!tableColumns) return [];
      return oridnals.map(ord => {
        const cc = tableColumns.find(c => c.ordinal_position === ord);
        return cc ? cc.column_name : ""
      })
    }

    function joinSubfix(tableA: string, columnsA: string[], tableB: string, columnsB: string[]): string {
      let query = '';
      for (let i = 0; i < columnsA.length; i++) {
        if (query) query += " AND "
        query += `${tableA}.${columnsA[i]} = ${tableB}.${columnsB[i]}`
      }
      return query || ''
    }

    function friendship(): {query: string, friendshipData: ConstraintDrawData[] } {
      if (!focusTable) return {query: "", friendshipData: []};
      const targetContraints = tableNameToConstraintsMap[focusTable];
      if (!targetContraints || targetContraints.length === 0) return {query: "", friendshipData: []};
      let foreignKeys = targetContraints.filter(con => con.constraint_type === ConstraintTypes.FOREIGN_KEY);
      if (!foreignKeys || foreignKeys.length === 0) return {query: "", friendshipData: []};
      const foreignKeysData: ConstraintDrawData[]  = foreignKeys.map(fk => ({
        ...fk, 
        columns_name: columnOrdinalsToNames(fk.table_name as string, fk.columns_index as number[]),
        ref_columns_name: columnOrdinalsToNames(fk.ref_table_name as string, fk.ref_columns_index as number[])
      }))

      const focusTableAlias = `${focusTable}0`;

      let selectQuery = `select * from ${schema}.${focusTable} ${focusTableAlias}`;

      let joinQueries = foreignKeysData.reduce((result, fk, i) => {
        const rtableAlias = `${fk.ref_table_name}${i}`
        let subfix = joinSubfix(
          focusTableAlias, fk.columns_name, 
          rtableAlias, fk.ref_columns_name);
        let joinQuery = subfix ? `
    JOIN ${schema}.${fk.ref_table_name} ${rtableAlias} on ${subfix}` : "";
        return result += joinQuery
      }, "");

      const fullQuery = `${selectQuery}${joinQueries}`;
      return  {query: fullQuery, friendshipData: foreignKeysData};
    }

    let {query, friendshipData} = friendship();
    if (!query) {
      query = `select * from ${schema}.${focusTable}`;
    }

    setQuery(query); // display query outside svg

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
    .classed('table-focus', d => d.name === focusTable)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.w)
    .attr('height', ch)
    .on("click", function(event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name)
      }
    })

    gTable
    .selectAll('text.table-name')
    .data(tablesData) //, function(d) {return (d as any).name;})
    .join('text')
    .classed("table-name", true)
    .classed('table-view', d => d.type === TableTypes.VIEW)
    .classed('table-focus', d => d.name === focusTable)
    .attr('x', d => d.x + cw/2)
    .attr('y', d => d.y + fontSize)
    .text(d => d.name)
    .on("click", function(event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name)
      }
    });

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
        return -1000; //0 + cw / 2;
      }
      return xy.x + cw / 2;
    })
    .attr('y', (d, index) => {
      const xy: XY = tableNameToXYMap[d.table_name]
      if (!xy) {
        return -1000;
      }
      return xy.y + d.ordinal_position * fontSize;
    })
    .text(d => {
      const colConstrs: ConstraintItem[] = tableNameToConstraintsMap[d.table_name];
      if (!colConstrs || colConstrs.length === 0) return d.column_name;
      // get all constraints
      let conTyps = [];
      let fkeyStrs = []; // 
      for (let con of colConstrs) {
        let indexes = con.columns_index;
        if (indexes && indexes.includes(d.ordinal_position)) {
          conTyps.push(con.constraint_type);
          if (con.constraint_type === ConstraintTypes.FOREIGN_KEY) {
            const refTable = con.ref_table_name as string;
            const refCols = con.ref_columns_index as number[];
            const refColItems = tableNameToColumnsMap[refTable]; // ordered by ordinal 
            const refColNames = refCols.map(ordinal => refColItems[ordinal-1].column_name).join(",");
            fkeyStrs.push(`${refTable}.${refColNames}`);
          }
        } 
      }
      if (conTyps.length === 0) return d.column_name;
      let conTypeStr = conTyps.join(",");
      return `${d.column_name} [ ${conTypeStr.toUpperCase()} ] ${fkeyStrs.join(',')}` 
    });
    
  }

const SvgMap: React.FC<Props> = ({schema, focusTable, tables, columns, constraints}) => {
  const dispatch = useDispatch();
  
  return <svg 
    className="schema-svg-map" 
    ref={ref => ref && draw(
      ref, 
      schema,
      focusTable, 
      tables, 
      columns, 
      constraints, 
      table => dispatch(setFocusTableSaga(table)),
      query => dispatch(setQuerySucceeded(query))
      )}
  />
}

export default SvgMap;