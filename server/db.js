"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listContraints = exports.listColumns = exports.listTables = void 0;
const pg_1 = require("pg");
// import secret from "./secret/secret.json"
const secret = require("./secret/secret.json");
const pool = new pg_1.Pool(secret);
async function listTables(schema = 'public') {
    const res = await pool.query(`select * from information_schema.tables where table_schema = '${schema}' and table_type = 'BASE TABLE'`);
    // console.log("### tables: ", res.rows);
    // console.log("### tables count: ", res.rowCount);
    return res;
}
exports.listTables = listTables;
async function listColumns(schema = 'public', table) {
    const res = await pool.query(`select * from information_schema.columns where table_schema = '${schema}' and table_name = '${table}'`);
    // console.log("### tables: ", res.rows);
    // console.log("### tables count: ", res.rowCount);
    return res;
}
exports.listColumns = listColumns;
async function listContraints(schema = 'public') {
    const res = await pool.query(`
  SELECT rel.relname as table_name, rel.oid as table_id, 
    con.conname as constraint, con.conname as column, 
    con.confrelid as ref_Table_id, 
    (select rel2.relname  from pg_catalog.pg_class rel2 where rel2.oid = con.confrelid) as ref_table_name,
    con.contype as contraint_type,
    con.conkey as self_columns_list, 
    con.confkey as ref_columns_list
       FROM pg_catalog.pg_constraint con
            INNER JOIN pg_catalog.pg_class rel
                       ON rel.oid = con.conrelid
            INNER JOIN pg_catalog.pg_namespace nsp
                       ON nsp.oid = connamespace
       WHERE nsp.nspname = 'public'
	   			and con.contype in ('f', 'p')
		order by rel.relname asc, con.contype desc
  `);
    // console.log("### tables: ", res.rows);
    // console.log("### tables count: ", res.rowCount);
    return res;
}
exports.listContraints = listContraints;
