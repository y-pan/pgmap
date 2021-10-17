import React, { useRef } from "react";
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
  mapFilter,
  MappingStrategy,
  mapTransform,
  SMap,
  timed,
  toDistinctMap,
} from "../../util/utils";
import { setFocusTableSaga } from "../../store/actions/tables";
import { useDispatch } from "react-redux";
import {
  addColumnNamesToConstrait,
  ColumnItemExtended,
  ConstraintItemExtended,
  enrichColumnData,
  EnrichedTableData,
  enrichTableData,
  getConstraintDrawData,
  indexColumnItemsMap,
  Margin,
  PathItemNamed,
  TableItemExtended,
  XY,
} from "./DataUtil";
import { wrapText } from "./UiUtil";
import {
  setQueryDataSucceeded,
  setTableWhereData,
} from "../../store/actions/calcs";
import WhereColumnBuilderMenu from "../whereBuilder/WhereColumnMenu";
import { Ref } from "react";

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
  focusTable: string | undefined,
  tables: TableItem[],
  columns: ColumnItem[],
  constraints: ConstraintItem[],
  onSetFocusTable: (table: string) => void,
  onSetQueryData: (
    t2Cols: SMap<ColumnItem[]>,
    focusConstraints: ConstraintItemExtended[]
  ) => void,
  onRightClickWhereableColumn: (
    x: number,
    y: number,
    column: ColumnItemExtended
  ) => void
) {
  if (!svgDom || !tables || !columns) {
    console.warn("Cannot draw!");
    return;
  }

  let filteredTables: TableItem[] = tables;
  let filteredConstraints: ConstraintItem[] = constraints;

  // process tables, constraints, columns
  const t2Cons: SMap<ConstraintItem[]> = groupBy<
    ConstraintItem,
    ConstraintItem
  >(constraints, (constraint) => constraint.table_name); // -> A table's constraints holds relationship.

  const t2Cols: SMap<ColumnItem[]> = indexColumnItemsMap(
    groupBy<ColumnItem, ColumnItem>(columns, (column) => column.table_name)
  );
  const t2ColCount: SMap<number> = mapTransform(
    t2Cols,
    (tableName) => tableName,
    (tableName, columns) => columns.length
  );

  const upstreamTableNames: Set<string> = new Set(); // tables holding relationship to focusTable. Displayed before focusTable
  const downstreamTableNames: Set<string> = new Set(); // tables where relationship owned by focusTable. Display after focusTable

  // TODO: add and use for styling
  const upstreamFks: Set<string> = new Set();
  const downstreamFks: Set<string> = new Set();

  if (focusTable) {
    // constraints having relationship

    filteredConstraints = constraints
      .filter((con) => con.constraint_type === ConstraintTypes.FOREIGN_KEY)
      .filter((con) => {
        if (con.table_name === focusTable) {
          downstreamTableNames.add(con.ref_table_name);
          downstreamFks.add(con.constraint);
          return true;
        }
        if (con.ref_table_name === focusTable) {
          upstreamTableNames.add(con.table_name);
          upstreamFks.add(con.constraint);
          return true;
        }
        return false;
      });

    const targetTableNameArray = filteredConstraints
      .flatMap((con) => [con.table_name, con.ref_table_name])
      .filter((tbName) => !!tbName);

    const tagetTableNameSet: Set<string> = new Set(targetTableNameArray);
    focusTable && tagetTableNameSet.add(focusTable); // some table has no relationship at all, and focusTable won't appear in targetTableNameArray. So need to add it anyway to display it.

    filteredTables = tables
      .filter((tb) => tagetTableNameSet.has(tb.table_name))
      .sort((t1, t2) => {
        // upstream tables (referencing focus tables) => focusTable => focusTable's referencing tables
        // by name asc
        const name1 = t1.table_name;
        const name2 = t2.table_name;

        const isT1Up = upstreamTableNames.has(name1);
        const isT1Down = downstreamTableNames.has(name1);

        const isT2Up = upstreamTableNames.has(name2);
        const isT2Down = downstreamTableNames.has(name2);

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

  // columns
  const enrichedColumns: ColumnItemExtended[] = enrichColumnData(
    focusTable,
    t2Cols,
    t2Pos,
    t2Cons
  );

  // TODO: query to be generated somewhere else, like DbMapTHead.
  //   Need to put to state: t2Cols;  consExtended.filter((con) => con.ref_table_name !== focusTable).
  //   Make table > columns builder component, collect a map of: table -> {column, op: =, !=, <, >, in, like, value}
  //   Use in generateSelectJoinWhereQuery
  const consExtended: ConstraintItemExtended[] = addColumnNamesToConstrait(
    focusTable ? filteredConstraints : constraints, // if has focusTable, then only take those related, otherwise take all
    t2Cols
  );

  onSetQueryData(
    focusTable &&
      mapFilter(
        t2Cols,
        (table) => table === focusTable || downstreamTableNames.has(table) // only need whereable tables: focusTable & downstream tables
      ),
    focusTable &&
      consExtended.filter((con) => con.ref_table_name !== focusTable)
  );

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
    .classed("upstream", (d) => upstreamTableNames.has(d.name))
    .classed("downstream", (d) => downstreamTableNames.has(d.name))
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.w)
    .attr("height", CELL_HEIGHT)
    .on("click", function (event, d) {
      event.stopPropagation();
      if (focusTable !== d.name) {
        onSetFocusTable(d.name);
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
        onSetFocusTable(d.name);
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
    .classed(
      "pointer",
      (d) =>
        focusTable &&
        (focusTable === d.table_name || downstreamTableNames.has(d.table_name))
    )
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y - CELL_HEIGHT)
    .attr("width", CELL_WIDTH)
    .attr("height", CELL_HEIGHT)
    .on("contextmenu", function (event, d) {
      event.stopPropagation();
      event.preventDefault();
      if (!focusTable) return;
      if (
        d.table_name === focusTable ||
        downstreamTableNames.has(d.table_name)
      ) {
        const { x, y } = event.target.getBoundingClientRect();
        onRightClickWhereableColumn(x, y, d);
      }
    });

  gColumn
    .selectAll("text.column-name")
    .data(enrichedColumns)
    .join("text")
    .classed("column-name", true)
    .classed(
      "pointer",
      (d) =>
        focusTable &&
        (focusTable === d.table_name || downstreamTableNames.has(d.table_name))
    )
    .attr("x", (d) => d.x + CELL_TEXT_PADDING_LEFT)
    .attr("y", (d) => d.y + CELL_TEXT_HEIGHT_ADJUSTMENT)
    .text((d) => wrapText(d.text, CELL_TEXT_FONT, CELL_TEXT_WIDTH))
    .on("contextmenu", function (event, d) {
      event.stopPropagation();
      event.preventDefault();
      if (!focusTable) return;
      if (
        d.table_name === focusTable ||
        downstreamTableNames.has(d.table_name)
      ) {
        const { x, y } = event.target.getBoundingClientRect();
        onRightClickWhereableColumn(x, y, d);
      }
    });

  // ------ draw db constraints -------
  // path marker def: arrow
  const svgDefs = svg.append("svg:defs");

  svgDefs
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
    .style("fill", "rgba(252, 113, 6, .7)");

  svgDefs
    .append("marker")
    .attr("id", "arrow-upstream")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", "rgba(255, 0, 98, .7)");

  svgDefs
    .append("marker")
    .attr("id", "arrow-downstream")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", "rgba(182, 177, 14, 0.7)");

  const constraintDrawData: PathItemNamed[] = getConstraintDrawData(
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
    .classed("upstream", (d) => upstreamFks.has(d.name))
    .classed("downstream", (d) => downstreamFks.has(d.name))
    .attr("d", (d) => {
      return line(d.path as any);
    })
    .attr("marker-end", (d) => {
      if (upstreamFks.has(d.name)) return "url(#arrow-upstream)";
      if (downstreamFks.has(d.name)) return "url(#arrow-downstream)";
      return "url(#arrow)";
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
  const builderRef: Ref<WhereColumnBuilderMenu> = useRef();
  // calculate proper width
  const leftList = document.getElementById("table-list");
  let leftListWidth = leftList ? leftList.clientWidth : 0; /* hardcoded */
  let availableWidth = window.innerWidth - leftListWidth - 100; /* margine */
  const svgWidth = Math.max(availableWidth, 500 /* hardcoded min width */);

  const onSetFocusTable = (newFocusTable) => {
    dispatch(setFocusTableSaga(newFocusTable));
    window.scrollTo(0, 0);
  };

  const onSetQueryData = (
    t2Cols: SMap<ColumnItem[]>,
    focusConstraints: ConstraintItemExtended[]
  ) =>
    dispatch(
      setQueryDataSucceeded({
        t2Cols,
        focusConstraints,
      })
    );

  const onRightClickWhereableColumn = (
    x: number,
    y: number,
    column: ColumnItemExtended
  ) => {
    if (!builderRef.current) {
      return;
    }
    builderRef.current.show(column, x + 10, y + CELL_HEIGHT);
  };

  const handleWhereColumnData = (tableName, columnValues) => {
    dispatch(setTableWhereData(columnValues));
  };

  return (
    <>
      <svg
        className="schema-svg-map"
        ref={(ref) =>
          ref &&
          timed(draw)(
            svgWidth,
            ref,
            focusTable,
            tables,
            columns,
            constraints,
            onSetFocusTable,
            onSetQueryData,
            onRightClickWhereableColumn
          )
        }
      />
      <WhereColumnBuilderMenu
        ref={builderRef}
        handleWhere={handleWhereColumnData}
      />
    </>
  );
};

export default SvgMap;
