import React from 'react';
import { ColumnItem, ConstraintItem, ConstraintTypes, TableItem, TableTypes } from '../../api/type';
import * as d3 from 'd3';
import { groupBy, MappingStrategy, SMap, toDistinctMap } from '../../api/Utils';
import { setFocusTableSaga, setQuerySucceeded } from '../../store/actions/tables';
import { useDispatch } from 'react-redux';
import { ConstraintDrawData, EnrichedTableData, enrichTableData, getTableAndFriends, TableDrawData, XY } from './DataUtil';

interface Props {
  schema: string,
  focusTable?: string;
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

export const FONT_SIZE = 15; // For "flyway_schema_history" FONT_SIZE 15 -> 116px w * 18px h
export const CELL_HEIGHT = 20; // cell height 
export const CELL_WIDTH = 500; // cell width 
export const TABLE_VSPACE = 15, TABLE_HSPACE = 15;

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

    // maps: table2Constraints, table2Columns, table2TablePos, table2
    const table2Constraints: SMap<ConstraintItem[]> = groupBy<ConstraintItem, ConstraintItem>(
      constraints, 
      constraint => constraint.table_name
    );
    const table2Columns: SMap<ColumnItem[]> = groupBy<ColumnItem, ColumnItem>(columns, column => column.table_name);
    const filteredTables: TableItem[] = focusTable ? getTableAndFriends(focusTable, tables, table2Constraints[focusTable]) : tables;
    const tableDrawData: EnrichedTableData = enrichTableData(filteredTables, table2Columns, TABLE_HSPACE, TABLE_VSPACE, svgW);
    const table2TablePos: SMap<XY> = toDistinctMap<TableDrawData, XY>(
      tableDrawData.data, 
      td => td.name, 
      td => ({x: td.x, y: td.y}),
      MappingStrategy.USE_LATEST_ON_DUPLICATE_WARNED
    );
    
    // focusTable, filteredTables, 
    function columnOrdinalsToNames(table: string, oridnals: number[]): string[] {
      if (!table || !oridnals || oridnals.length === 0) return [];
      const tableColumns = table2Columns[table];
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
      const targetContraints = table2Constraints[focusTable];
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
      query = focusTable ? `select * from ${schema}.${focusTable}` : '';
    }

    setQuery(query); // display query outside svg

    // draw
    const svg = d3.select(svgDom)
    .attr("width", svgW)
    .attr("height", tableDrawData.drawAreaHeight);

    // Clean up everything. 
    svg.selectAll('g').remove();

    // tables
    const gTable = svg.append('g')
    .classed("g-table", true);

    // - tables: boxs
    gTable.selectAll('rect.table')
    .data(tableDrawData.data) //, function(d) {return (d as any).name;})
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
    .data(tableDrawData.data) //, function(d) {return (d as any).name;})
    .join('rect')
    .classed("table-name", true)
    .classed('table-view', d => d.type === TableTypes.VIEW)
    .classed('table-focus', d => d.name === focusTable)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.w)
    .attr('height', CELL_HEIGHT)
    .on("click", function(event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name)
      }
    })

    gTable
    .selectAll('text.table-name')
    .data(tableDrawData.data) //, function(d) {return (d as any).name;})
    .join('text')
    .classed("table-name", true)
    .classed('table-view', d => d.type === TableTypes.VIEW)
    .classed('table-focus', d => d.name === focusTable)
    .attr('x', d => d.x + CELL_WIDTH/2)
    .attr('y', d => d.y + FONT_SIZE)
    .text(d => `${d.name} [${table2Columns[d.name].length}]`)
    .on("click", function(event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name)
      }
    });

    // columns
    const gColumnOuter = svg.append('g')
    .classed("g-column-outer", true)
    .attr('transform', `translate(0, ${CELL_HEIGHT})`);

    gColumnOuter.selectAll("text.column-name")
    .data(columns)
    .join('text')
    .classed('column-name', true)
    .attr('x', d => {
      const xy: XY = table2TablePos[d.table_name];
      if (!xy) {
        return -1000; //0 + CELL_WIDTH / 2;
      }
      return xy.x + CELL_WIDTH / 2;
    })
    .attr('y', (d, index) => {
      const xy: XY = table2TablePos[d.table_name]
      if (!xy) {
        return -1000;
      }
      return xy.y + d.ordinal_position * FONT_SIZE;
    })
    .text(d => {
      const colConstrs: ConstraintItem[] = table2Constraints[d.table_name];
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
            const refColItems = table2Columns[refTable]; // ordered by ordinal 
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
      newFocusTable => {
        dispatch(setFocusTableSaga(newFocusTable));
        window.scrollTo(0, 0);
      },
      query => dispatch(setQuerySucceeded(query))
      )}
  />
}

export default SvgMap;