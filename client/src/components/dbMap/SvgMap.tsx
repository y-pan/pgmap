import React from "react";
import {
  ColumnItem,
  ConstraintItem,
  ConstraintTypes,
  TableItem,
  TableTypes,
} from "../../api/type";
import * as d3 from "d3";
import {
  compare,
  groupBy,
  MappingStrategy,
  mapTransform,
  SMap,
  timed,
  toDistinctMap,
} from "../../util/utils";
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
  indexColumnItemsMap,
  Margin,
  TableItemExtended,
  XY,
} from "./DataUtil";
import { wrapText } from "./UiUtil";
import { SequentialSet } from "../../util/SequentialSet";

interface Props {
  schema: string;
  focusTable?: string;
  tables: TableItem[];
  columns: ColumnItem[];
  constraints: ConstraintItem[];
}

declare const window: any | Window;

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

window.d3 = d3;

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
  const t2Cons: SMap<ConstraintItem[]> = groupBy<
    ConstraintItem,
    ConstraintItem
  >(constraints, (constraint) => constraint.table_name); // -> A table's constraints holds relationship.

  window.constraints = constraints;
  window.t2Cons = t2Cons;

  const t2Cols: SMap<ColumnItem[]> = indexColumnItemsMap(
    groupBy<ColumnItem, ColumnItem>(columns, (column) => column.table_name)
  );
  const t2ColCount: SMap<number> = mapTransform(
    t2Cols,
    (tableName) => tableName,
    (tableName, columns) => columns.length
  );

  let filteredTables: TableItem[] = tables;
  let filteredConstraints: ConstraintItem[] = constraints;
  if (focusTable) {
    // constraints having relationship
    const upstream: Set<string> = new Set(); // tables holding relationship to focusTable. Displayed before focusTable
    const downstream: Set<string> = new Set(); // tables where relationship owned by focusTable. Display after focusTable

    filteredConstraints = constraints
      .filter((con) => con.constraint_type === ConstraintTypes.FOREIGN_KEY)
      .filter((con) => {
        if (con.table_name === focusTable) {
          downstream.add(con.ref_table_name);
          return true;
        }
        if (con.ref_table_name === focusTable) {
          upstream.add(con.table_name);
          return true;
        }
        return false;
      });

    const targetTableNameArray = filteredConstraints
      .flatMap((con) => [con.table_name, con.ref_table_name])
      .filter((tbName) => !!tbName);

    const tagetTableNameSet: Set<string> = new Set(targetTableNameArray);
    filteredTables = tables
      .filter((tb) => tagetTableNameSet.has(tb.table_name))
      .sort((t1, t2) => {
        // upstream tables (referencing focus tables) => focusTable => focusTable's referencing tables
        // by name asc
        const name1 = t1.table_name;
        const name2 = t2.table_name;

        const isT1Up = upstream.has(name1);
        const isT1Down = downstream.has(name1);

        const isT2Up = upstream.has(name2);
        const isT2Down = downstream.has(name2);

        if (isT1Up && !isT2Up) {
          // t1, t2 is already in sorted order, don't swap
          return -1;
        }
        if (!isT1Up && isT2Up) {
          // t1, t2 is reversed order, need to swap
          return 1;
        }
        if (isT1Down && !isT2Down) {
          // t1, t2 is reversed order, need to swap
          return 1;
        }
        if (!isT1Down && isT2Down) {
          // t1 t2 is in already in sorted order, don't swap
          return -1;
        }
        // they are in the same segment: both in upstream, or both in downstream. sort they by name
        return compare(name1, name2);
      });
  }

  const {
    tableData,
    totalWidth,
    totalHeight,
  }: EnrichedTableData = enrichTableData(
    filteredTables,
    t2ColCount,
    TABLE_HSPACE,
    TABLE_VSPACE,
    svgWidth
  );
  const t2Pos: SMap<XY> = toDistinctMap<TableItemExtended, XY>( // for columns
    tableData,
    (td) => td.name,
    (td) => ({ x: td.x, y: td.y }),
    MappingStrategy.USE_LATEST_ON_DUPLICATE_WARNED
  );

  const { query, consExtended } = friendship(
    // CONS
    schema,
    focusTable,
    focusTable ? filteredConstraints : constraints, // if has focusTable, then only take those related, otherwise take all
    t2Cols
  );

  // columns
  const enrichedColumns: ColumnItemExtended[] = enrichColumnData(
    focusTable,
    t2Cols,
    t2Pos,
    t2Cons
  );

  let selectJoinQuery = query;
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
    .attr("width", totalWidth + MARGIN.left + MARGIN.right)
    .attr("height", totalHeight + MARGIN.top + MARGIN.bottom);

  // Clean up everything.
  svg.selectAll("*").remove();

  // ------ draw begins ------
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
    .data(tableData)
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
    .data(tableData)
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
    .data(tableData) //, function(d) {return (d as any).name;})
    .join("text")
    .classed("table-name", true)
    .classed("table-view", (d) => d.type === TableTypes.VIEW)
    .classed("table-focus", (d) => d.name === focusTable)
    .attr("x", (d) => d.x + CELL_TEXT_PADDING_LEFT)
    .attr("y", (d) => d.y + CELL_HEIGHT + CELL_TEXT_HEIGHT_ADJUSTMENT)
    .text(
      (d) => wrapText(d.name, CELL_TABLE_NAME_FONT, CELL_TEXT_WIDTH)
      // `${d.name} [Size: ${t2Cols[d.name].length}, Type: ${d.type}]`
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
    .classed("column-fk", (d) => d.cons.has(ConstraintTypes.FOREIGN_KEY))
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
  // path marker def: arrow
  svg
    .append("svg:defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", "rgba(252, 113, 6, 1)");

  const constraintDrawData = getConstraintDrawData(
    // CONS
    consExtended,
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
    .attr("marker-end", "url(#arrow)")
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
  let availableWidth = window.innerWidth - leftListWidth - 100; /* margine */
  const svgWidth = Math.max(availableWidth, 500 /* hardcoded min width */);

  return (
    <svg
      className="schema-svg-map"
      ref={(ref) =>
        ref &&
        timed(draw)(
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
