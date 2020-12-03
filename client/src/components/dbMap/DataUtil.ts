import {
  ColumnItem,
  ConstraintItem,
  ConstraintTypes,
  DataTypes,
  TableItem,
  TableTypes,
} from "../../api/type";
import { asArray } from "../../util/arrayUtil";
import { compare, groupBy, SMap } from "../../util/utils";
import SelectColumnsBuilder from "./SelectColumnsBuilder";
import { CELL_HEIGHT, CELL_WIDTH, TABLE_HSPACE, TABLE_VSPACE } from "./SvgMap";
import WhereColumnValueBuilder from "./WhereColumnValueBuilder";

export interface Margin {
  top: number;
  left: number;
  bottom: number;
  right: number;
}
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
}

export interface HasText {
  text: string;
}
// db-column means the column in db
// ui-column means the drawed column on UI
/** @summary returns array of [w, h] */
export function tableWH(size: number): { w: number; h: number } {
  return {
    w: CELL_WIDTH, // 1 cell, or 1 ui-column, per ui-row
    h:
      CELL_HEIGHT *
      (size /* how many db-columns of the table */ + 1) /* table name */,
  };
}

export interface ColumnItemExtended extends ColumnItem, XY, HasText {
  // column need to know its constraint type(s)
  cons: Set<ConstraintTypes>;
}

export interface ConstraintItemExtended extends ConstraintItem {
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
  constraints: ConstraintItem[] = [] // all related fks (self table owning relationship, and other tables)
): TableItem[] {
  if (!focusTable) return allTables;

  let filteredTables: TableItem[] = [];

  // Make a set of refTableSet, for fast lookup
  const refTableSet: Set<string> = new Set();
  for (let constr of constraints) {
    constr.ref_table_name && refTableSet.add(constr.ref_table_name);
    constr.table_name && refTableSet.add(constr.table_name);
  }

  // O(N)

  for (let table of allTables) {
    if (focusTable === table.table_name) {
      filteredTables.unshift(table); // push to front
    }
    if (refTableSet.has(table.table_name)) {
      refTableSet.delete(table.table_name);
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
  tableData: TableItemExtended[];
  totalWidth: number;
  totalHeight: number;
}

export function enrichTableData(
  tableItems: TableItem[],
  table2Size: SMap<number>,
  hSpace: number = TABLE_HSPACE,
  vSpace: number = TABLE_VSPACE,
  drawAreaWdith: number
): EnrichedTableData {
  let cursorX = 0,
    cursorY = 0,
    cursorH = 0;
  const tableData: TableItemExtended[] = [];
  for (let tableItem of tableItems) {
    const { w, h } = tableWH(table2Size[tableItem.table_name]);

    if (cursorX + w < drawAreaWdith) {
      // keep append table to the right, on same row
      tableData.push({
        name: tableItem.table_name,
        type: tableItem.table_type,
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
      tableData.push({
        name: tableItem.table_name,
        type: tableItem.table_type,
        x: cursorX,
        y: cursorY,
        w,
        h,
      });
      cursorX += w + hSpace;
    }
  }
  return {
    tableData: tableData,
    totalHeight: cursorY + cursorH,
    totalWidth: drawAreaWdith,
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
  consExtended: ConstraintItemExtended[];
}

export enum WhereOps {
  EQ = "=",
  NE = "!=",
  LT = "<",
  LE = "<=",
  GT = ">",
  GE = ">=",
  IN = "IN",
  NOT_IN = "NOT IN",
  LIKE = "LIKE", // For non-numeric DataTypes
  ILIKE = "ILIKE", // For non-numeric DataTypes
  NOT_LIKE = "NOT LIKE", // For non-numeric DataTypes
  NOT_ILIKE = "NOT ILIKE", // For non-numeric DataTypes
}

export function allWhereOps() {
  return [
    WhereOps.EQ,
    WhereOps.NE,
    WhereOps.LT,
    WhereOps.LE,
    WhereOps.GT,
    WhereOps.GE,
    WhereOps.ILIKE, // NOT for numeric
    WhereOps.LIKE,
    WhereOps.IN,
    WhereOps.NOT_ILIKE,
    WhereOps.NOT_LIKE,
    WhereOps.NOT_IN,
  ];
}

export const DEFAULT_OP = WhereOps.EQ;

export interface WhereColumnValue {
  // Only care about <table>.<column> <op> [<value>
  // This alone can't handle AND/OR logic, and will be somewhere else.
  table: string;
  column: string;
  op: WhereOps; // Examples: =, >, <, in, like, ilike
  value: string | number | string[] | number[]; // Examples: 1, "one", [1,3,4], ["male", "female", "unknown"]
  dataType: DataTypes; // To decide if value to be single-quoted (for non-numeric type), or non-quoted (for numeric type)
}

export function generateSelectJoinWhereQuery(
  schema: string, // non-empty
  focusTable: string, // non-empty
  enrichedFkConstraints: ConstraintItemExtended[], // store in state   con.ref_table_name !== focusTable
  t2Cols: SMap<ColumnItem[]>, // store in state,
  whereColumnValue?: SMap<WhereColumnValue[]> // table -> column values
): string {
  // use enrichedFkConstraints to generate query string
  const selectBuilder = new SelectColumnsBuilder();
  if (!schema || !focusTable) {
    return "";
  }

  // query requires a focus table
  const focusTableAlias = `${focusTable}0`;
  let fromClause = `FROM ${schema}.${focusTable} ${focusTableAlias}`;

  selectBuilder.add(
    focusTable,
    focusTableAlias,
    asArray(t2Cols[focusTable]).map((c) => c.column_name)
  );

  const joinClauses: string = enrichedFkConstraints
    // .filter((con) => con.ref_table_name !== focusTable) // no join on upstream tables
    .reduce((result, fk, i) => {
      const rtableAlias = `${fk.ref_table_name}${i}`;
      selectBuilder.add(
        fk.ref_table_name,
        rtableAlias,
        t2Cols[fk.ref_table_name].map((c) => c.column_name)
      );
      const subfix = joinQuerySubfix(
        focusTableAlias,
        fk.columns_name,
        rtableAlias,
        fk.ref_columns_name
      );
      const joinQuery = subfix
        ? `    LEFT JOIN ${schema}.${fk.ref_table_name} ${rtableAlias} ON ${subfix}\n`
        : "";
      return (result += joinQuery);
    }, "");

  const selectClause = selectBuilder.build();

  const whereClause = new WhereColumnValueBuilder()
    .tableAlias(selectBuilder.getTableAlias())
    .tableColumnValues(whereColumnValue)
    .build();

  return `${selectClause}\n${fromClause}\n${joinClauses}\n${whereClause}`;
}

export function addColumnNamesToConstrait(
  constraints: ConstraintItem[], // filteredContstraints | allConstraints
  t2Cols: SMap<ColumnItem[]>
): ConstraintItemExtended[] {
  if (!constraints) return [];

  const fkConstraints = constraints.filter(
    (con) => con.constraint_type === ConstraintTypes.FOREIGN_KEY
  );

  if (!fkConstraints) return [];

  return fkConstraints.map((fk) => ({
    ...fk,
    columns_name: columnOrdinalsToNames(
      fk.columns_index,
      t2Cols[fk.table_name]
    ),
    ref_columns_name: columnOrdinalsToNames(
      fk.ref_columns_index,
      t2Cols[fk.ref_table_name]
    ),
  }));
}

const COLUMN_TEXT_MARGIN_LEFT: number = 0;

export function indexColumnItems(columns: ColumnItem[]): ColumnItem[] {
  if (!columns) return columns;
  return (
    columns
      // .sort(col => col.ordinal_position)  // no sort, assuming backend already sorted by ordinal_position
      .map((col, index) => ({ ...col, index }))
  );
}

export function indexColumnItemsMap(
  t2Cols: SMap<ColumnItem[]>
): SMap<ColumnItem[]> {
  if (!t2Cols) return t2Cols;
  let newMap = {};
  for (let key in t2Cols) {
    let columnItems: ColumnItem[] = t2Cols[key];
    newMap[key] = indexColumnItems(columnItems);
  }
  return newMap;
}

export function enrichColumnData(
  focusTable: string,
  t2Cols: SMap<ColumnItem[]>,
  t2Pos: SMap<XY>,
  t2Cons: SMap<ConstraintItem[]>
): ColumnItemExtended[] {
  const columnsExtended: ColumnItemExtended[] = Object.values(t2Cols)
    .flat()
    .filter((col) => !!t2Pos[col.table_name])
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
      const tablePos: XY = t2Pos[col.table_name];
      const x = tablePos.x + COLUMN_TEXT_MARGIN_LEFT;
      const y = tablePos.y + (col.index + 1) * CELL_HEIGHT; // tricky
      let text: string = col.column_name;
      const colConstraints: ConstraintItem[] = t2Cons[col.table_name];
      const consSet: Set<ConstraintTypes> = new Set();

      if (colConstraints && colConstraints.length > 0) {
        let constTypes: ConstraintTypes[] = [];
        let fkeyStrs: string[] = [];
        for (let constr of colConstraints) {
          let indexArray = constr.columns_index;
          if (indexArray && indexArray.includes(col.ordinal_position)) {
            constTypes.push(constr.constraint_type);
            consSet.add(constr.constraint_type);
            if (constr.constraint_type === ConstraintTypes.FOREIGN_KEY) {
              // display <table>.<column> as well
              const refTable: string = constr.ref_table_name;
              const refColOrdinals = constr.ref_columns_index; // The is actually the ordinal_position, 1-base
              const refColItems: ColumnItem[] = t2Cols[refTable]; // Ordered by ordinal already. To improve effeciency
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

      return { ...col, x, y, text, cons: consSet };
    });

  return columnsExtended;
}

export type PathItem = number[][];
export interface PathItemNamed {
  path: PathItem;
  name: string;
}

export function getConstraintDrawData(
  constraints: ConstraintItemExtended[], // fk
  columns: ColumnItemExtended[],
  tableNameSet: Set<string>
): PathItemNamed[] {
  const pathes: PathItemNamed[] = [];
  const t2ColsExtended: SMap<ColumnItemExtended[]> = groupBy(
    columns,
    (col) => col.table_name
  );

  constraints
    .filter((constr) => constr.constraint_type === ConstraintTypes.FOREIGN_KEY)
    .forEach((constr) => {
      const selfTable = constr.table_name;
      const selfColNames = new Set<string>(constr.columns_name);
      const foreignTable = constr.ref_table_name;
      const foreignColNames = new Set<string>(constr.ref_columns_name);

      // normally they are just 1 self-column -> 1 foreign-column.
      const selfCols: ColumnItemExtended[] = t2ColsExtended[
        selfTable
      ].filter((col) => selfColNames.has(col.column_name));
      const foreignCols: ColumnItemExtended[] = t2ColsExtended[
        foreignTable
      ].filter((col) => foreignColNames.has(col.column_name));

      if (selfCols.length !== foreignCols.length)
        console.warn(`Foreign key columns not compatible!`);

      for (let i = 0; i < selfCols.length; i++) {
        pathes.push({
          name: constr.constraint,
          path: pathItemOf(selfCols[i], foreignCols[i]),
        });
      }
    });
  return pathes;
}

const xShift: number = 10;
function pathItemOf(p1: XY, p2: XY): PathItem {
  const _p1: number[] = [
    p1.x >= p2.x ? p1.x : p1.x + CELL_WIDTH,
    p1.y + CELL_HEIGHT / 2,
  ];
  const _p2: number[] = [
    p2.x >= p1.x ? p2.x : p2.x + CELL_WIDTH,
    p2.y + CELL_HEIGHT / 2,
  ];

  const middlePath: number[][] = [];
  if (_p1[0] === _p2[0]) {
    /**
     * vertically same, make it like this shape:
     *     -- user_id [f] user.id
     *    |
     *    |
     *     -- id [p]
     */
    middlePath.push([_p1[0] - xShift, _p1[1]]);
    middlePath.push([_p2[0] - xShift, _p2[1]]);
  }

  return [_p1, ...middlePath, _p2];
}

// export interface TableItemFull extends TableItemExtended {}
// export interface ColumnItemFull extends ColumnItemExtended {}
// export interface ConstraintItemFull extends ConstraintItemExtended {}
// export interface DrawData {
//   tableData: TableItemFull[];
//   columData: ColumnItemFull[];
//   constraintData: ConstraintItemFull[];
// }

// export function processData(
//   focusTable: string | undefined,
//   tables: TableItem[],
//   columns: ColumnItem[],
//   constraints: ConstraintItem[],
//   svgWidth: number,
//   tableHSpace: number = TABLE_HSPACE,
//   tableVSpace: number = TABLE_VSPACE
// ): DrawData {
//   // filter/group constraints
//   const { fCons, pCons, uCons, tNames } = filterConstraints(
//     constraints,
//     focusTable
//   );
//   focusTable && tNames.add(focusTable); // Add the focus table any, in case it has no constraint

//   // filter tables
//   const tbFiltered: TableItem[] = tables.filter((tb) =>
//     tNames.has(tb.table_name)
//   );

//   // group columns by table
//   const tb2Cols: SMap<ColumnItem[]> = groupBy(
//     columns.filter((col) => tNames.has(col.table_name)),
//     (col) => col.table_name
//   );
//   const tb2Sizes: SMap<number> = mapTransform(
//     tb2Cols,
//     (tableName) => tableName,
//     (tableName, columns) => columns.length
//   );

//   // calc table pixel size, and total draw pixel size
//   const tableDataExtended: EnrichedTableData = enrichTableData(
//     tbFiltered,
//     tb2Sizes,
//     tableHSpace,
//     tableVSpace,
//     svgWidth
//   );

//   const friendshipData = friendship;
//   /// ==============
//   let tableData: TableItemFull[] = [];
//   let columnData: ColumnItemFull[] = [];
//   let constraintData: ConstraintItemFull[] = [];

//   let tablesNeeded: TableItem[] = tables;
//   let columnsNeeded: ColumnItem[] = columns;

//   if (!focusTable) {
//     tableData = tables as any;
//     columnData = columns as any;
//     constraintData = constraints as any;
//   } else {
//     // has focusTable, will show: [focusTable, tablesReferencedByFocus, tablesReferencingFocus]
//     tableData = [tables.find((tb) => tb.table_name === focusTable)];
//   }

//   return null;
// }

// interface ConstraintFilterResult {
//   fCons: ConstraintItem[];
//   pCons: ConstraintItem[];
//   uCons: ConstraintItem[];
//   tNames: Set<string>;
// }
// function filterConstraints(
//   constraints: ConstraintItem[],
//   focusTable: string
// ): ConstraintFilterResult {
//   let fCons: ConstraintItem[] = [];
//   let pCons: ConstraintItem[] = [];
//   let uCons: ConstraintItem[] = [];
//   let tNames: Set<string> = new Set();

//   // putting needed constraints into own buckets
//   for (let con of constraints) {
//     switch (con.constraint_type) {
//       case ConstraintTypes.FOREIGN_KEY:
//         if (
//           !focusTable ||
//           focusTable === con.table_name ||
//           focusTable === con.ref_table_name
//         ) {
//           fCons.push(con);
//           tNames.add(con.table_name);
//           tNames.add(con.ref_table_name);
//         }
//         break;
//       case ConstraintTypes.PRIMARY_KEY:
//         if (!focusTable || focusTable === con.table_name) {
//           pCons.push(con);
//           tNames.add(con.table_name);
//         }
//         break;
//       case ConstraintTypes.UNIQUE:
//         if (!focusTable || focusTable === con.table_name) {
//           uCons.push(con);
//           tNames.add(con.table_name);
//         }
//         break;
//       default:
//         console.warn("Unknown constraint type: " + con.constraint_type);
//         break;
//     }
//   }

//   return {
//     fCons,
//     pCons,
//     uCons,
//     tNames,
//   };
// }
