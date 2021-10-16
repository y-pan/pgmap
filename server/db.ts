import { Client, QueryResult, QueryResultRow } from "pg";
const secret = require("./secret/secret.json");
const isDebug = true;

let client;
let currentDatabase;

interface FetchResult {
  items: string[] | QueryResultRow[] | any[];
  count: number;
}

function resetPgClient(): Promise<void> {
  currentDatabase = "";
  try {
    if (client) {
      client.end();
    }
    client = new Client({...secret, database: "postgres"});
    return client.connect();
  } catch (e) {
    log("Failed to reset pgClient");
    log(e);
  }
}

resetPgClient();

export async function useDataBase(database: string): Promise<void> {
  if (!currentDatabase && !database) {
    throw new Error("Error: database has to be specified");
  }
  if (!currentDatabase || currentDatabase !== database) {
    try {
      if (client) {
        await client.end();
      }
      
      client = new Client({...secret, database});

      await client.connect();
      currentDatabase = database;
      log(`Using db ${database}`);
    } catch (e) {
      await resetPgClient();
      log(e);
      throw e;
    }
  }
}

export async function fetchDatabases(): Promise<FetchResult> {
  const queryStr = `SELECT datname FROM pg_database;`;
  logQuery(queryStr);
  const {rows, rowCount} = await client.query(queryStr)
  return {items: rows.map(row => row.datname), count: rowCount}
}

export async function fetchSchemas(database: string): Promise<FetchResult> {
  if (!database) {
    log(`database is required`);
    throw new Error(`database is required`)
  }

  await useDataBase(database);
  const queryStr = `
  SELECT schema_name
  FROM information_schema.schemata
  `;

  logQuery(queryStr);

  const { rows, rowCount }: QueryResult<QueryResultRow> = await client.query(
    queryStr
  );
  return {
    items: rows.map((schema) => schema.schema_name),
    count: rowCount,
  };
}

export async function fetchTables(schema?: string): Promise<FetchResult> {
  let whereClause = "";
  if (schema) {
    whereClause = `WHERE table_schema = '${schema}'`;
    // whereClause = `
    // WHERE table_schema = '${schema}' AND table_type = 'BASE TABLE'
    // `
  } else {
    // whereClause = `
    // WHERE table_type = 'BASE TABLE'
    // `
  }
  const queryStr = `
  SELECT 
    table_schema,
    table_name,
    table_type
  FROM information_schema.tables 
  ${whereClause}
  order by table_type, table_name
  `;

  logQuery(queryStr);

  const { rowCount, rows }: QueryResult<QueryResultRow> = await client.query(
    queryStr
  );
  return {
    count: rowCount,
    items: rows, //.map(row => row.table_name)
  };
}

export async function fetchColumnsByTable(
  schema: string,
  table: string
): Promise<FetchResult> {
  const whereClause = getWhereForQueryColumns(schema, table);

  const queryStr = `
  SELECT 
  table_schema,
  table_name,
  column_name, 
  data_type,
  ordinal_position
  FROM information_schema.columns 
  ${whereClause}
  `;

  logQuery(queryStr);

  const { rowCount, rows }: QueryResult<QueryResultRow> = await client.query(
    queryStr
  );
  return {
    count: rowCount,
    items: rows, // rows.sort(colDef => colDef.ordinal_position).map(colDef => colDef.column_name)
  };
}

export async function fetchContraints(
  schema: string,
  table: string
): Promise<FetchResult> {
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
    con.contype AS constraint_type,
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

  logQuery(queryStr);

  const { rowCount, rows }: QueryResult<QueryResultRow> = await client.query(
    queryStr
  );
  return {
    count: rowCount,
    items: rows,
  };
}

function getWhereForQueryColumns(schema, table): string {
  if (!schema && !table) return "";
  let whereClause = "";
  if (schema) {
    whereClause += ` table_schema = '${schema}' `;
  }
  if (table) {
    if (whereClause) {
      whereClause += " AND ";
    }
    whereClause += ` table_name = '${table}' `;
  }
  return whereClause ? ` WHERE ${whereClause}` : "";
}

async function fetchIndexes(
  schema: string,
  table: string
): Promise<FetchResult> {
  const whereClause = ``;
  const queryStr = `
  SELECT
  * -- schemaname, tablename, indexname, tablespace, indexdef
    FROM
        pg_indexes
    -- WHERE
    --     schemaname = 'public'
    ORDER BY
        tablename,
        indexname;
    `;
  const { rowCount, rows }: QueryResult<QueryResultRow> = await client.query(
    queryStr
  );
  return {
    count: rowCount,
    items: rows,
  };
}

function getWhereForFetchContraints(schema: string, table: string): string {
  if (!schema && !table) return "";
  let whereClause = "";
  if (schema) {
    whereClause += ` nsp.nspname = '${schema}' `;
  }
  if (table) {
    if (whereClause) {
      whereClause += " AND ";
    }
    whereClause += ` rel.relname = '${table}' `;
  }
  // AND con.contype IN ('f', 'p', 'u')
  return whereClause ? ` WHERE ${whereClause}` : "";
}

function logQuery(query) {
  isDebug && log(`[query]:\n${query}`);
}

function log(msg) {
  console.log(`${new Date().toISOString()}`, msg);
}
