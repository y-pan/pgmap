//
export enum ConstraintTypes {
  PRIMARY_KEY = "p",
  FOREIGN_KEY = "f",
  UNIQUE = "u",
}

// items
export type SchemaItem = string;
interface hasTableSchema {
  table_schema: string;
}
interface hasTableName {
  table_name: string;
}
interface hasColumnName {
  column_name: string;
}

interface HasIndex {
  index?: number;
}
export enum TableTypes {
  BASE_TABLE = "BASE TABLE",
  VIEW = "VIEW",
}

export interface TableItem extends hasTableSchema, hasTableName {
  table_type: TableTypes;
}

export interface ColumnItem
  extends hasTableSchema,
    hasTableName,
    hasColumnName,
    HasIndex {
  ordinal_position: number; // ordinal_position (1-base) is needed to match foreign key column (stored using ordinal_position) to column name
  // but oridinal_position is not enough for UI display, as gap may exist in ordinal_position.
  // So the index (0-base) is added, frontend only;
}

export interface ConstraintItem {
  table_name: string;
  constraint: string;
  constraint_type: ConstraintTypes;
  ref_table_name: string | null;
  columns_index: number[] | null;
  ref_columns_index: number[] | null;
}

// response
export interface FetchResponse<T> {
  count: number;
  items: T[];
}
export type SchemaResponse = FetchResponse<SchemaItem>;
export type TableResponse = FetchResponse<TableItem>;
export type ConstraintResponse = FetchResponse<ConstraintItem>;
export type ColumnResponse = FetchResponse<ColumnItem>;
