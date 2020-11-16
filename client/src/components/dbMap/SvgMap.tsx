import React from "react";
import {
  ColumnItem,
  ConstraintItem,
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
  getConstraintDrawData,
  getTableAndFriends,
  indexColumnItemsMap,
  Margin,
  TableItemExtended,
  XY,
} from "./DataUtil";
import { wrapText } from "./UiUtil";

interface Props {
  schema: string;
  focusTable?: string;
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

export const MARGIN: Margin = { top: 10, left: 30, right: 30, bottom: 10 };
export const CELL_HEIGHT: number = 21; // ui-cell height
export const CELL_WIDTH: number = 200; // ui-cell width

export const TABLE_VSPACE: number = 30;
export const TABLE_HSPACE: number = 30;

// CELL_TEXT_HEIGHT_ADJUSTMENT: in each *ItemExtended (TableItemExtended, ColumnItemExtended), the calculated `y` is just right for `rect`, but not for `text`, need to plus this adjustment.
export const CELL_TEXT_HEIGHT_ADJUSTMENT: number = -5;
export const CELL_TEXT_PADDING_LEFT: number = 5; // So not to touch rect's left border
export const CELL_TEXT_PADDING_RIGHT: number = 5; // So not to touch rect's left border
export const CELL_TEXT_WIDTH: number =
  CELL_WIDTH - CELL_TEXT_PADDING_LEFT - CELL_TEXT_PADDING_RIGHT;
export const CELL_TEXT_FONT = `15px Arial`;
export const CELL_TABLE_NAME_FONT = `bold 15px Arial`;

const drawConstraint: boolean = false; // enable it when ready
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
  const enrichedFilteredTables: EnrichedTableData = enrichTableData(
    filteredTables,
    table2Columns,
    TABLE_HSPACE,
    TABLE_VSPACE,
    svgWidth
  );
  const table2TablePos: SMap<XY> = toDistinctMap<TableItemExtended, XY>(
    enrichedFilteredTables.data,
    (td) => td.name,
    (td) => ({ x: td.x, y: td.y }),
    MappingStrategy.USE_LATEST_ON_DUPLICATE_WARNED
  );

  const friendshipData = friendship(
    schema,
    focusTable,
    focusTable ? table2Constraints[focusTable] : constraints, // if has focusTable, then only take those related, otherwise take all
    table2Columns
  );

  // columns
  const enrichedColumns: ColumnItemExtended[] = enrichColumnData(
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
    .attr(
      "width",
      enrichedFilteredTables.drawAreaWidth + MARGIN.left + MARGIN.right
    )
    .attr(
      "height",
      enrichedFilteredTables.drawAreaHeight + MARGIN.top + MARGIN.bottom
    );

  // Clean up everything.
  svg.selectAll("g").remove();

  const g = svg
    .append("g")
    .classed("g-box", true)
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

  const gTable = g.append("g").classed("g-table", true);
  const gColumn = g.append("g").classed("g-column", true);
  const gConstraint = g.append("g").classed("g-contraint", true);

  // ------ draw db table -------
  gTable
    .selectAll("rect.table")
    .data(enrichedFilteredTables.data) //, function(d) {return (d as any).name;})
    .enter()
    .append("rect")
    // .join('rect')
    .classed("table", true)
    .classed("table-view", (d) => d.type === TableTypes.VIEW)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.w)
    .attr("height", (d) => d.h);

  gTable
    .selectAll("rect.table-name")
    .data(enrichedFilteredTables.data) //, function(d) {return (d as any).name;})
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
    .data(enrichedFilteredTables.data) //, function(d) {return (d as any).name;})
    .join("text")
    .classed("table-name", true)
    .classed("table-view", (d) => d.type === TableTypes.VIEW)
    .classed("table-focus", (d) => d.name === focusTable)
    .attr("x", (d) => d.x + CELL_TEXT_PADDING_LEFT)
    .attr("y", (d) => d.y + CELL_HEIGHT + CELL_TEXT_HEIGHT_ADJUSTMENT)
    .text(
      (d) => wrapText(d.name, CELL_TABLE_NAME_FONT, CELL_TEXT_WIDTH)
      // `${d.name} [Size: ${table2Columns[d.name].length}, Type: ${d.type}]`
    )
    .on("click", function (event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        setFocusTable(d.name);
      }
    });

  // ------ draw db columns -------
  gColumn.attr("transform", `translate(0, ${CELL_HEIGHT})`);

  gColumn
    .selectAll("rect.column-name")
    .data(enrichedColumns)
    .join("rect")
    .classed("column-name", true)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y - CELL_HEIGHT)
    .attr("width", CELL_WIDTH)
    .attr("height", CELL_HEIGHT);

  gColumn
    .selectAll("text.column-name")
    .data(enrichedColumns)
    .join("text")
    .classed("column-name", true)
    .attr("x", (d) => d.x + CELL_TEXT_PADDING_LEFT)
    .attr("y", (d) => d.y + CELL_TEXT_HEIGHT_ADJUSTMENT)
    .text((d) => wrapText(d.text, CELL_TEXT_FONT, CELL_TEXT_WIDTH));

  // ------ draw db constraints -------
  if (!drawConstraint) {
    return;
  }
  const constraintDrawData = getConstraintDrawData(
    friendshipData.data,
    enrichedColumns,
    new Set<string>(filteredTables.map((table) => table.table_name))
  );

  const line = d3.line();
  gConstraint
    .selectAll("path.constraint")
    .data(constraintDrawData)
    .enter()
    .append("path")
    .classed("constraint", true)
    .attr("d", (d) => {
      return line(d as any);
    })
    .on("mouseover", function (event, d) {
      event.preventDefault();
      this.classList.add("hightlight");
    })
    .on("mouseout", function (event, d) {
      event.preventDefault();
      this.classList.remove("hightlight");
    });
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
