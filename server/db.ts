import { Pool, Client, QueryResult, QueryResultRow } from 'pg';
// import secret from "./secret/secret.json"
const secret = require("./secret/secret.json")
const pool = new Pool(secret)

export async function fetchTables(schema='public') {
  const {rowCount, rows}: QueryResult<QueryResultRow> = await pool.query(`
  select table_name 
  from information_schema.tables 
  where table_schema = '${schema}' 
  and table_type = 'BASE TABLE'
  `);
  return {
    count: rowCount, 
    items: rows.map(row => row['table_name'])
  }
}

export async function fetchColumns(schema='public', table) {
  const {rowCount, rows}: QueryResult<QueryResultRow> = await pool.query(`
  select column_name, ordinal_position
  from information_schema.columns 
  where table_schema = '${schema}' 
  and table_name = '${table}'
  `);
  return {
    count: rowCount, 
    items: rows.sort(colDef => colDef.ordinal_position).map(colDef => colDef['column_name'])
  };
}

export async function fetchContraints(schema='public', table) {
  const {rowCount, rows}: QueryResult<QueryResultRow> = await pool.query(`
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
  WHERE 
    nsp.nspname = '${schema}'
    ${table ? `AND rel.relname = '${table}'` : ''}
    AND con.contype IN ('f', 'p', 'u')
  ORDER BY 
    rel.relname asc, con.contype desc
  `);
  return {
    count: rowCount,
    items: rows
  };
}