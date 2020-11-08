// 
export enum ConstraintTypes {
  PRIMARY_KEY = 'p',
  FOREIGN_KEY = 'f',
  UNIQUE = 'u',
}

// items
export interface SchemaItem {
  schema_name: string
}
export type TableItem = string;
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
