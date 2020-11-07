import { Pool, Client, QueryResult, QueryResultRow } from 'pg';
const secret = require("./secret/secret.json")
const pool = new Pool(secret)
const isDebug = true;

interface FetchResult {
  items: string[] | QueryResultRow[] | any[],
  count: number
}

export async function fetchSchemas(): Promise<FetchResult> {
  const queryStr = `
  SELECT schema_name
  FROM information_schema.schemata
  `;

  logQuery(queryStr)

  const {rows, rowCount}: QueryResult<QueryResultRow> = await pool.query(queryStr);
  return {
    items: rows,
    count: rowCount
  }
}

export async function fetchTablesBySchema(schema: string): Promise<FetchResult> {
  const queryStr = `
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = '${schema}' 
  AND table_type = 'BASE TABLE'
  `;

  logQuery(queryStr)

  const {rowCount, rows}: QueryResult<QueryResultRow> = await pool.query(queryStr);
  return {
    count: rowCount, 
    items: rows.map(row => row.table_name)
  }
}

export async function fetchColumnsByTable(schema: string, table: string): Promise<FetchResult> {
  const queryStr = `
  SELECT column_name, ordinal_position
  FROM information_schema.columns 
  WHERE table_schema = '${schema}' 
  AND table_name = '${table}'
  `;

  logQuery(queryStr);
  
  const {rowCount, rows}: QueryResult<QueryResultRow> = await pool.query(queryStr);
  return {
    count: rowCount, 
    items: rows.sort(colDef => colDef.ordinal_position).map(colDef => colDef.column_name)
  };
}

export async function fetchContraints(schema: string, table: string): Promise<FetchResult> {
  const whereClause = getWhereForFetchContraints(schema, table);

  const queryStr = `
  SELECT
    rel.relname AS table_name, 
    -- rel.oid AS table_id, 
    con.conname AS constraint, 
    -- con.confrelid AS ref_Table_id, 
    (SELECT rel2.relname 
      FROM pg_catalog.pg_class rel2 
      WHERE rel2.oid = con.confrelid) AS ref_table_name,
    con.contype AS contraint_type,
    con.conkey AS columns_index, 
    con.confkey AS ref_columns_index
  FROM 
    pg_catalog.pg_constraint con
    INNER JOIN pg_catalog.pg_class rel
                ON rel.oid = con.conrelid
    INNER JOIN pg_catalog.pg_namespace nsp
                  ON nsp.oid = connamespace
  ${whereClause}
  ORDER BY 
    rel.relname asc, con.contype desc
  `;

  logQuery(queryStr)

  const {rowCount, rows}: QueryResult<QueryResultRow> = await pool.query(queryStr);
  return {
    count: rowCount,
    items: rows
  };
}

function getWhereForFetchContraints(schema: string, table: string): string {
  if (!schema && !table) return ''
  let whereClause = ''
  if (schema) {
    whereClause +=  ` nsp.nspname = '${schema}' `;
  }
  if (table) {
    if (whereClause) {
      whereClause += " AND ";
    }
    whereClause += ` rel.relname = '${table}' `;
  }
  // AND con.contype IN ('f', 'p', 'u')
  return whereClause ? ` WHERE ${whereClause}` : '';
}

function logQuery(query) {
  isDebug && console.log(`[query]:\n${query}`);
}