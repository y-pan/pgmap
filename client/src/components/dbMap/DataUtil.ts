import {
  ColumnItem,
  ConstraintItem,
  ConstraintTypes,
  TableItem,
  TableTypes,
} from "../../api/type";
import { compare, SMap } from "../../api/Utils";
import { CELL_HEIGHT, CELL_WIDTH, FONT_HEIGHT } from "./SvgMap";

export interface XY {
  x: number;
  y: number;
}

export interface WH {
  w: number;
  h: number;
}

export interface TableItemExtended extends XY, WH {
  type: TableTypes;
  name: string;
  columns: ColumnItem[]; // columns of the table
}

export interface HasText {
  text: string;
}

/** @summary returns array of [w, h] */
export function tableWH(size: number): { w: number; h: number } {
  return { w: CELL_WIDTH, h: CELL_HEIGHT * size + 1 }; // 1 is for table_name itself
}

export interface ColumnItemExtended extends ColumnItem, XY, HasText {
  // column need to know its constraint type(s)
}

export interface ConstraintDrawData extends ConstraintItem {
  // connect all column points when hover/double-click
  // constraint need to know where column(s) located, for
  columns_name: string[]; // connterpart to columns_index: number[]
  ref_columns_name: string[]; // counterpart to ref_columns_index: number[]
}

/**
 * @summary filter out the focus and the friends, by constraints.
 * returns all if no focus
 */
export function getTableAndFriends(
  focusTable: string,
  allTables: TableItem[],
  constraints: ConstraintItem[] = []
): TableItem[] {
  if (!focusTable) return allTables;

  let filteredTables: TableItem[] = [];

  // Make a set of refTableSet, for fast lookup
  const refTableSet: Set<string> = new Set();
  for (let constr of constraints) {
    constr.ref_table_name && refTableSet.add(constr.ref_table_name);
  }

  // O(N)
  for (let table of allTables) {
    if (focusTable === table.table_name) {
      filteredTables.unshift(table); // push to front
    }
    if (refTableSet.has(table.table_name)) {
      filteredTables.push(table); // push to back
    }
  }
  return filteredTables;
}

/**
 * @summary sort tables in place, by type (BASE_TABLE vs VIEW) and name, both asc
 * Maybe no need of frontend sort, since backend query did sorting already
 *  */
export function sortTableByTypeName(tables: TableItem[]): TableItem[] {
  if (!tables) return tables;
  return tables.sort((t1, t2) => {
    let compType = compare(t1.table_type, t2.table_type);
    if (compType !== 0) return compType;
    return compare(t1.table_name, t2.table_name);
  });
}

export interface EnrichedTableData {
  data: TableItemExtended[];
  drawAreaWidth: number;
  drawAreaHeight: number;
}

export function enrichTableData(
  tableItems: TableItem[],
  table2Columns: SMap<ColumnItem[]>,
  hSpace: number,
  vSpace: number,
  drawAreaWdith: number
): EnrichedTableData {
  let cursorX = 0,
    cursorY = 0,
    cursorH = 0;
  const filteredTableData: TableItemExtended[] = [];
  for (let tableItem of tableItems) {
    const tableCols: ColumnItem[] = table2Columns[tableItem.table_name];
    const { w, h } = tableWH(tableCols.length);

    if (cursorX + w < drawAreaWdith) {
      // keep append table to the right, on same row
      filteredTableData.push({
        name: tableItem.table_name,
        type: tableItem.table_type,
        columns: tableCols,
        x: cursorX,
        y: cursorY,
        w,
        h,
      });
      cursorX = cursorX + w + hSpace;
      cursorH = Math.max(cursorH, h);
    } else {
      // new line
      cursorX = 0;
      cursorY += cursorH + vSpace;
      cursorH = h;
      filteredTableData.push({
        name: tableItem.table_name,
        type: tableItem.table_type,
        columns: tableCols,
        x: cursorX,
        y: cursorY,
        w,
        h,
      });
      cursorX += w + hSpace;
    }
  }
  return {
    data: filteredTableData,
    drawAreaHeight: cursorY + cursorH,
    drawAreaWidth: drawAreaWdith,
  };
}

/** @summary get names array, by ordinal_position array */
export function columnOrdinalsToNames(
  oridnals: number[],
  tableColumns: ColumnItem[]
): string[] {
  if (!oridnals || !tableColumns) return [];
  return oridnals.map((ord) => {
    const cc = tableColumns.find((c) => c.ordinal_position === ord);
    return cc ? cc.column_name : "";
  });
}

/**
 * @summary get subfix for join state depending on how many pairs of relationship:
 * For single pair looks like:  user.id = order.user_id
 * For 2 pairs looks like:   user.id = order.user_id AND user.order_type = order.order_type
 */
export function joinQuerySubfix(
  tableA: string,
  columnsA: string[],
  tableB: string,
  columnsB: string[]
): string {
  let query = "";

  if (!tableA || !tableB) throw new Error("Table name is missing.");
  if (columnsA.length !== columnsB.length)
    throw new Error("Column sizes don't match!");

  for (let i = 0; i < columnsA.length; i++) {
    if (query) query += " AND ";
    query += `${tableA}.${columnsA[i]} = ${tableB}.${columnsB[i]}`;
  }
  return query || "";
}

export interface FriendShipData {
  query: string;
  data: ConstraintDrawData[];
}

export function friendship(
  schema: string,
  focusTable: string,
  constraints: ConstraintItem[],
  table2Columns: SMap<ColumnItem[]>
): FriendShipData {
  if (!schema || !focusTable || !constraints) return { query: "", data: [] };

  const fkConstraints = constraints.filter(
    (con) => con.constraint_type === ConstraintTypes.FOREIGN_KEY
  );

  if (!fkConstraints) return { query: "", data: [] };

  const enrichedFkConstraints: ConstraintDrawData[] = fkConstraints.map(
    (fk) => ({
      ...fk,
      columns_name: columnOrdinalsToNames(
        fk.columns_index,
        table2Columns[fk.table_name]
      ),
      ref_columns_name: columnOrdinalsToNames(
        fk.ref_columns_index,
        table2Columns[fk.ref_table_name]
      ),
    })
  );

  // use enrichedFkConstraints to generate query string
  const focusTableAlias = `${focusTable}0`;
  let selectQuery = `SELECT * FROM ${schema}.${focusTable} ${focusTableAlias}`;

  let joinQueries: string = enrichedFkConstraints.reduce((result, fk, i) => {
    const rtableAlias = `${fk.ref_table_name}${i}`;
    let subfix = joinQuerySubfix(
      focusTableAlias,
      fk.columns_name,
      rtableAlias,
      fk.ref_columns_name
    );
    let joinQuery = subfix
      ? `
  JOIN ${schema}.${fk.ref_table_name} ${rtableAlias} on ${subfix}`
      : "";
    return (result += joinQuery);
  }, "");

  const fullQuery = `${selectQuery}${joinQueries}`;
  return { query: fullQuery, data: enrichedFkConstraints };
}
const COLUMN_TEXT_MARGIN_LEFT: number = 10;

export function indexColumnItems(columns: ColumnItem[]): ColumnItem[] {
  if (!columns) return columns;
  return (
    columns
      // .sort(col => col.ordinal_position)  // no sort, assuming backend already sorted by ordinal_position
      .map((col, index) => ({ ...col, index }))
  );
}

export function indexColumnItemsMap(
  table2Columns: SMap<ColumnItem[]>
): SMap<ColumnItem[]> {
  if (!table2Columns) return table2Columns;
  let newMap = {};
  for (let key in table2Columns) {
    let columnItems: ColumnItem[] = table2Columns[key];
    newMap[key] = indexColumnItems(columnItems);
  }
  return newMap;
}

export function enrichColumnData(
  focusTable: string,
  table2Columns: SMap<ColumnItem[]>,
  table2TablePos: SMap<XY>,
  table2Constraints: SMap<ConstraintItem[]>
): ColumnItemExtended[] {
  const columnsExtended: ColumnItemExtended[] = Object.values(table2Columns)
    .flat()
    .filter((col) => !!table2TablePos[col.table_name])
    .sort((col1, col2) => {
      // Sort is not mandatory. With/without sort, the UI is the same.
      // It only affect the order of dom elements. Good for debugging with dom element ordered, just like the UI.
      // Disable sorting need higher performance.
      const tableComp = compare(col1.table_name, col2.table_name);
      if (tableComp === 0) {
        // same table, just compare the ordinal
        return compare(col1.ordinal_position, col2.ordinal_position);
      }

      // different tables, focusTable's column should be on the top, then compare ordinal
      if (col1.table_name === focusTable) {
        return -1; // col1 will be above col2, regardless the name compare
      }
      if (col2.table_name === focusTable) {
        return 1; // col2 will be above col1, regardless the name compare
      }
      return tableComp; // They are not from the focus table, use name compare
    })
    .map((col) => {
      const tablePos: XY = table2TablePos[col.table_name];
      const x = tablePos.x + COLUMN_TEXT_MARGIN_LEFT;
      const y = tablePos.y + (col.index + 1) * FONT_HEIGHT; // tricky
      let text: string = col.column_name;
      const colConstraints: ConstraintItem[] =
        table2Constraints[col.table_name];

      if (colConstraints && colConstraints.length > 0) {
        let constTypes: ConstraintTypes[] = [];
        let fkeyStrs: string[] = [];
        for (let constr of colConstraints) {
          let indexArray = constr.columns_index;
          if (indexArray && indexArray.includes(col.ordinal_position)) {
            constTypes.push(constr.constraint_type);
            if (constr.constraint_type === ConstraintTypes.FOREIGN_KEY) {
              // display <table>.<column> as well
              const refTable: string = constr.ref_table_name;
              const refColOrdinals = constr.ref_columns_index; // The is actually the ordinal_position, 1-base
              const refColItems: ColumnItem[] = table2Columns[refTable]; // Ordered by ordinal already. To improve effeciency
              const refColNamesStr: string = refColOrdinals
                .map((ordinalPos, index) => refColItems[index].column_name)
                .join(",");
              fkeyStrs.push(`${refTable}.${refColNamesStr}`);
            }
          }
        }

        const conTypesStr: string = constTypes.join(","); // like `p,f,u`
        const conTypesStrDisplay: string = conTypesStr
          ? ` [${conTypesStr}] `
          : ""; // like  ` [p,f,u] `
        const fkeyStrsDisplay = fkeyStrs.join(","); // like `user.id`
        text = `${col.column_name}${conTypesStrDisplay}${fkeyStrsDisplay}`; // like `user_id [f,u] user.id`
      }

      return { ...col, x, y, text };
    });

  return columnsExtended;
}

// const BrowserText = (function () {
//   const canvas = document.createElement("canvas");
//   const context = canvas.getContext("2d");

//   /**
//    * Measures the rendered width of arbitrary text given the font size and font face
//    * @param {string} text The text to measure
//    * @param {number} fontSize The font size in pixels
//    * @param {string} fontFace The font face ("Arial", "Helvetica", etc.)
//    * @returns {number} The width of the text
//    **/
//   function getWidth(
//     text = "hello world",
//     fontSize = 25,
//     fontFace = "Helvetica"
//   ) {
//     context.font = fontSize + "px " + fontFace;
//     return context.measureText(text).width;
//   }

//   return {
//     getWidth: getWidth,
//   };
// })();

// // Then call it like this:
// console.log(BrowserText.getWidth("hello world", 22, "Arial")); // 105.166015625
// console.log(BrowserText.getWidth("hello world", 22)); // 100.8154296875
