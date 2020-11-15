import React from "react";
import {
  ColumnItem,
  ConstraintItem,
  ConstraintTypes,
  TableItem,
  TableTypes,
} from "../../api/type";
import * as d3 from "d3";
import { groupBy, MappingStrategy, SMap, toDistinctMap } from "../../api/Utils";
import {
  setFocusTableSaga,
  setQuerySucceeded,
} from "../../store/actions/tables";
import { useDispatch } from "react-redux";
import {
  ColumnItemExtended,
  enrichColumnData,
  EnrichedTableData,
  enrichTableData,
  friendship,
  getTableAndFriends,
  indexColumnItemsMap,
  TableItemExtended,
  XY,
} from "./DataUtil";

interface Props {
  schema: string;
  focusTable?: string;
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

export const MARGIN = { top: 10, left: 10, right: 10, bottom: 10 };

// CELL_TEXT_HEIGHT_ADJUSTMENT: in each *ItemExtended (TableItemExtended, ColumnItemExtended), the calculated `y` is just right for `rect`, but not for `text`, need to plus this adjustment.
export const CELL_TEXT_HEIGHT_ADJUSTMENT = -5;
export const CELL_TEXT_X_ADJUSTMENT = 10; // So not to touch rect's left border
export const CELL_HEIGHT = 21; // ui-cell height
export const CELL_WIDTH = 500; // ui-cell width
export const TABLE_VSPACE = 15;
export const TABLE_HSPACE = 15;

function draw(
  svgWidth: number,
  svgDom: SVGElement,
  schema: string,
  focusTable: string | undefined,
  tables: TableItem[],
  columns: ColumnItem[],
  constraints: ConstraintItem[],
  setFocusTable: (table: string) => any,
  setQuery: (query: string) => void
) {
  if (!svgDom || !tables || !columns) {
    console.warn("Cannot draw!");
    return;
  }

  // process tables, constraints, columns
  const table2Constraints: SMap<ConstraintItem[]> = groupBy<
    ConstraintItem,
    ConstraintItem
  >(constraints, (constraint) => constraint.table_name);
  const table2Columns: SMap<ColumnItem[]> = indexColumnItemsMap(
    groupBy<ColumnItem, ColumnItem>(columns, (column) => column.table_name)
  );

  // There might be some gap in ordinal_position number might be missing. We need to actual index
  const filteredTables: TableItem[] = focusTable
    ? getTableAndFriends(focusTable, tables, table2Constraints[focusTable])
    : tables;
  const tableDrawData: EnrichedTableData = enrichTableData(
    filteredTables,
    table2Columns,
    TABLE_HSPACE,
    TABLE_VSPACE,
    svgWidth
  );
  const table2TablePos: SMap<XY> = toDistinctMap<TableItemExtended, XY>(
    tableDrawData.data,
    (td) => td.name,
    (td) => ({ x: td.x, y: td.y }),
    MappingStrategy.USE_LATEST_ON_DUPLICATE_WARNED
  );

  const friendshipData = friendship(
    schema,
    focusTable,
    table2Constraints[focusTable],
    table2Columns
  );

  // columns
  const enrichedColumnData: ColumnItemExtended[] = enrichColumnData(
    focusTable,
    table2Columns,
    table2TablePos,
    table2Constraints
  );

  let selectJoinQuery = friendshipData.query;
  if (!selectJoinQuery) {
    selectJoinQuery = focusTable ? `SELECT * FROM ${schema}.${focusTable}` : "";
  }

  setQuery(selectJoinQuery); // display query outside svg

  // draw
  /**
   * Hierarchy:
   *    svg (width/height takes margins and calculated drawing area size into accounts)
   *      > g.g-box (1 container to apply margins.)
   *        > g.g-*  (containers for rects and texts.)
   *
   * Note: <g> has no style attached to the class (g-*), which is only for debugging purpose.
   *       <g> is made for logical grouping, and with some translate(x,y) as needed, and nothing else.
   */

  const svg = d3
    .select(svgDom)
    .attr("width", tableDrawData.drawAreaWidth + MARGIN.left + MARGIN.right)
    .attr("height", tableDrawData.drawAreaHeight + MARGIN.top + MARGIN.bottom);

  // Clean up everything.
  svg.selectAll("g").remove();

  const g = svg
    .append("g")
    .classed("g-box", true)
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);
  // tables
  const gTable = g.classed("g-table", true);

  // - tables: boxs
  gTable
    .selectAll("rect.table")
    .data(tableDrawData.data) //, function(d) {return (d as any).name;})
    .enter()
    .append("rect")
    // .join('rect')
    .classed("table", true)
    .classed("table-view", (d) => d.type === TableTypes.VIEW)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.w)
    .attr("height", (d) => d.h);

  // - table: names
  gTable
    .selectAll("rect.table-name")
    .data(tableDrawData.data) //, function(d) {return (d as any).name;})
    .join("rect")
    .classed("table-name", true)
    .classed("table-view", (d) => d.type === TableTypes.VIEW)
    .classed("table-focus", (d) => d.name === focusTable)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.w)
    .attr("height", CELL_HEIGHT)
    .on("click", function (event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name);
      }
    });

  gTable
    .append("g")
    .selectAll("text.table-name")
    .data(tableDrawData.data) //, function(d) {return (d as any).name;})
    .join("text")
    .classed("table-name", true)
    .classed("table-view", (d) => d.type === TableTypes.VIEW)
    .classed("table-focus", (d) => d.name === focusTable)
    .attr("x", (d) => d.x + CELL_TEXT_X_ADJUSTMENT)
    .attr("y", (d) => d.y + CELL_HEIGHT + CELL_TEXT_HEIGHT_ADJUSTMENT)
    .text(
      (d) =>
        `${d.name} [Size: ${table2Columns[d.name].length}, Type: ${d.type}]`
    )
    .on("click", function (event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name);
      }
    });

  const gColumnOuter = g
    .append("g")
    .classed("g-column-outer", true)
    .attr("transform", `translate(0, ${CELL_HEIGHT})`);

  gColumnOuter
    .selectAll("rect.column-name")
    .data(enrichedColumnData)
    .join("rect")
    .classed("column-name", true)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y - CELL_HEIGHT)
    .attr("width", CELL_WIDTH)
    .attr("height", CELL_HEIGHT);

  gColumnOuter
    .selectAll("text.column-name")
    .data(enrichedColumnData)
    .join("text")
    .classed("column-name", true)
    .attr("x", (d) => d.x + CELL_TEXT_X_ADJUSTMENT)
    .attr("y", (d) => d.y + CELL_TEXT_HEIGHT_ADJUSTMENT)
    .text((d) => d.text);

  // Draw friendship connections, using: enrichedColumnData (knows position) & constraints!
}

const SvgMap: React.FC<Props> = ({
  schema,
  focusTable,
  tables,
  columns,
  constraints,
}) => {
  const dispatch = useDispatch();
  // calculate proper width
  const leftList = document.getElementById("table-list");
  let leftListWidth = leftList ? leftList.clientWidth : 0; /* hardcoded */
  let availableWidth = window.innerWidth - leftListWidth - 60; /* margine */
  const svgWidth = Math.max(availableWidth, 500 /* hardcoded min width */);
  console.log("svgWidth", svgWidth, leftListWidth);
  return (
    <svg
      className="schema-svg-map"
      ref={(ref) =>
        ref &&
        draw(
          svgWidth,
          ref,
          schema,
          focusTable,
          tables,
          columns,
          constraints,
          (newFocusTable) => {
            dispatch(setFocusTableSaga(newFocusTable));
            window.scrollTo(0, 0);
          },
          (query) => dispatch(setQuerySucceeded(query))
        )
      }
    />
  );
};

export default SvgMap;
