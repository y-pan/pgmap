"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const cors = require("cors");
const app = express();
const { clientPort, serverPort } = require("./config/config.json");
// middlewares
app.use(cors());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.options("*", cors({
    origin: `http://localhost:${clientPort}`,
}));
// routes
// list databases
app.get('/api/databases', async (req, res, next) => {
    try {
        const databases = await (db_1.fetchDatabases());
        res.json(databases);
    }
    catch (e) {
        next(e);
    }
});
// list schemas
app.get("/api/schemas", async (req, res, next) => {
    try {
        const database = req.query.database;
        const schemas = await db_1.fetchSchemas(database); // schema names only
        res.json(schemas);
    }
    catch (e) {
        next(e);
    }
});
// list tables, optionally by schema
app.get("/api/tables", async (req, res, next) => {
    try {
        const schema = req.query.schema;
        if (!schema) {
            throw new Error("Schema is required!");
        }
        const tables = await db_1.fetchTables(schema); // table names only
        res.json(tables);
    }
    catch (e) {
        next(e);
    }
});
// list columns of a table
app.get("/api/columns", async (req, res, next) => {
    try {
        const schema = req.query.schema;
        const table = req.query.table;
        if (!schema) {
            throw new Error("Schema is required!");
        }
        const columns = await db_1.fetchColumnsByTable(schema, table);
        res.json(columns);
    }
    catch (e) {
        next(e);
    }
});
// list constraints, optionally by schema/table
app.get("/api/constraints", async (req, res, next) => {
    try {
        const schema = req.query.schema;
        const table = req.query.table;
        if (!schema) {
            throw new Error("Schema is required!");
        }
        const results = await db_1.fetchContraints(schema, table);
        res.json(results);
    }
    catch (e) {
        next(e);
    }
});
app.get("*", async (req, res, next) => {
    next(new Error("Bad request!"));
});
// app run
app.listen(serverPort, async function () {
    console.log(`Server is running on port: ${serverPort}`);
});
