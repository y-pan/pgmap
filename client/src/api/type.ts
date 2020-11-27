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

interface hasDataType {
  data_type: DataTypes;
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
    hasDataType,
    HasIndex {
  ordinal_position: number; // ordinal_position (1-base) is needed to match foreign key column (stored using ordinal_position) to column name
  // but oridinal_position is not enough for UI display, as gap may exist in ordinal_position.
  // So the index (0-base) is added, frontend only;
}

export enum DataTypes {
  NUMERIC = "numeric",
  INT = "integer",
  BIGINT = "bigint",
  SMALLINT = "smallint",
  DOUBLE_PRECISION = "double precision",
  MONEY = "money",
  REAL = "real",

  BOOLEAN = "boolean",

  TEXT = "text",
  CHAR = "char",
  CHARACTER = "character",
  NAME = "name",
  VARCHAR = "character varying",

  DATE = "date",
  ABSTIME = "abstime",
  TIMESTAME_WITH_TIME_ZONE = "timestamp with time zone",
  TIMESTAME_WITHOUT_TIME_ZONE = "timestamp without time zone",
  TIME_WITH_TIME_ZONE = "time with time zone",
  TIME_WITHOUT_TIME_ZONE = "time without time zone",

  JSON = "json",
  JSONB = "jsonb",

  UUID = "uuid",

  OID = "oid",
  REGCLASS = "regclass",
  REGCONFIG = "regconfig",
  REGDICTIONARY = "regdictionary",
  REGNAMESPACE = "regnamespace",
  REGOPER = "regoper",
  REGOPERATOR = "regoperator",
  REGPROC = "regproc",
  REGPROCEDURE = "regprocedure",
  REGROLE = "regrole",
  REGTYPE = "regtype",
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
