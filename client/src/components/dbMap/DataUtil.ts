import {
  ColumnItem,
  ConstraintItem,
  TableItem,
  TableTypes,
} from "../../api/type";
import { compare, SMap } from "../../api/Utils";
import { CELL_HEIGHT, CELL_WIDTH } from "./SvgMap";

export interface XY {
  x: number;
  y: number;
}

export interface WH {
  w: number;
  h: number;
}

export interface TableDrawData extends XY, WH {
  type: TableTypes;
  name: string;
  columns: ColumnItem[]; // columns of the table
}

/** @summary returns array of [w, h] */
export function tableWH(size: number): { w: number; h: number } {
  return { w: CELL_WIDTH, h: CELL_HEIGHT * size + 1 }; // 1 is for table_name itself
}

export interface ColumnDrawData extends ColumnItem, XY, WH {
  // column need to know its constraint type(s)
}

export interface ConstraintDrawData extends ConstraintItem {
  // connect all column points when hover/double-click
  // constraint need to know where column(s) located, for
  columns_name: string[];
  ref_columns_name: string[];
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
  data: TableDrawData[];
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
  const filteredTableData: TableDrawData[] = [];
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
