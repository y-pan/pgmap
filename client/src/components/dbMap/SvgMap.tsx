import React from 'react';
import { ColumnItem, ConstraintItem, ConstraintTypes, TableItem, TableTypes } from '../../api/type';
import * as d3 from 'd3';
import { groupBy, MappingStrategy, SMap, toDistinctMap } from '../../api/Utils';
import { setFocusTableSaga, setQuerySucceeded } from '../../store/actions/tables';
import { useDispatch } from 'react-redux';
import { ColumnItemExtended, enrichColumnData, EnrichedTableData, enrichTableData, friendship, getTableAndFriends, TableItemExtended, XY } from './DataUtil';

interface Props {
  schema: string,
  focusTable?: string;
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

// export const FONT_SIZE = 15; // For "flyway_schema_history" FONT_SIZE 15 -> 116px w * 18px h
export const FONT_HEIGHT = 18; // magic number !
export const CELL_HEIGHT = 25; // cell height 
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

    // process tables, constraints, columns
    const table2Constraints: SMap<ConstraintItem[]> = groupBy<ConstraintItem, ConstraintItem>(
      constraints, 
      constraint => constraint.table_name
    );
    const table2Columns: SMap<ColumnItem[]> = groupBy<ColumnItem, ColumnItem>(columns, column => column.table_name);
    const filteredTables: TableItem[] = focusTable ? getTableAndFriends(focusTable, tables, table2Constraints[focusTable]) : tables;
    const tableDrawData: EnrichedTableData = enrichTableData(filteredTables, table2Columns, TABLE_HSPACE, TABLE_VSPACE, svgW);
    const table2TablePos: SMap<XY> = toDistinctMap<TableItemExtended, XY>(
      tableDrawData.data, 
      td => td.name, 
      td => ({x: td.x, y: td.y}),
      MappingStrategy.USE_LATEST_ON_DUPLICATE_WARNED
    );

    const friendshipData = friendship(schema, focusTable, table2Constraints[focusTable], table2Columns);

    // columns
    const enrichedColumnData: ColumnItemExtended[] = enrichColumnData(columns, table2Columns, table2TablePos, table2Constraints);
    
    let selectJoinQuery = friendshipData.query;
    if (!selectJoinQuery) {
      selectJoinQuery = focusTable ? `SELECT * FROM ${schema}.${focusTable}` : '';
    }

    setQuery(selectJoinQuery); // display query outside svg

    // draw
    const svg = d3.select(svgDom)
    .attr("width", tableDrawData.drawAreaWidth)
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
    .attr('y', d => d.y + FONT_HEIGHT)
    .text(d => `${d.name} [${table2Columns[d.name].length}]`)
    .on("click", function(event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name)
      }
    });

    const gColumnOuter = svg.append('g')
    .classed("g-column-outer", true)
    .attr('transform', `translate(0, ${CELL_HEIGHT})`);

    gColumnOuter.selectAll("text.column-name")
    .data(enrichedColumnData)
    .join('text')
    .classed('column-name', true)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .text(d => d.text);
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