import express = require("express");
const path = require("path");
import bodyParser from "body-parser";
import {
  fetchSchemas,
  fetchTables,
  fetchColumnsByTable,
  fetchContraints,
  fetchDatabases,
} from "./db";
const cors = require("cors");

const app: express.Application = express();

const { clientPort, serverPort } = require("./config/config.json");

// middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.options(
  "*",
  cors({
    origin: `http://localhost:${clientPort}`, // frontend dev
  })
);

// routes
// list databases
app.get('/api/databases', async (req, res) => {
  const databases = await(fetchDatabases())
  res.json(databases);
});

// list schemas
app.get("/api/schemas", async (req, res) => {
  const database = req.query.database as string;
  const schemas = await fetchSchemas(database); // schema names only
  res.json(schemas);
});

// list tables, optionally by schema
app.get("/api/tables", async (req, res, next) => {
  const schema = req.query.schema as string;
  if (!schema) {
    return res.status(400).send({ error: "Schema is required!" });
  }
  const tables = await fetchTables(schema); // table names only
  res.json(tables);
});

// list columns of a table
app.get("/api/columns", async (req, res, next) => {
  const schema = req.query.schema as string;
  const table = req.query.table as string;
  if (!schema) {
    return res.status(400).send({ error: "Schema is required!" });
  }

  const columns = await fetchColumnsByTable(schema, table);
  res.json(columns);
});

// list constraints, optionally by schema/table
app.get("/api/constraints", async (req, res) => {
  const schema = req.query.schema as string;
  const table = req.query.table as string;
  if (!schema) {
    return res.status(400).send({ error: "Schema is required!" });
  }

  const results = await fetchContraints(schema, table);
  res.json(results);
});

app.get("*", async (req, res) => {
  res.json({ message: "Bad request!" }).status(404);
});

// app run
app.listen(serverPort, async function () {
  console.log(`Server is running on port: ${serverPort}`);
});
