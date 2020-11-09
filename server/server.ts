import express = require('express');
const path = require('path');
import bodyParser from "body-parser";
import {fetchSchemas, fetchTables, fetchColumnsByTable, fetchContraints} from "./db";
const cors = require('cors')

const app: express.Application = express();

// middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static(path.join(__dirname, 'public')))
app.options('*', cors({
    origin: "http://localhost:3000" // frontend dev
}))

// routes
// list schemas
app.get('/api/schemas', async (req, res) => {
    const schemas = await fetchSchemas() // schema names only
    res.json(schemas)
});

// list tables, optionally by schema
app.get('/api/tables', async (req, res) => {
    const schema = req.query.schema as string
    const tables = await fetchTables(schema) // table names only
    res.json(tables)
});

// list constraints, optionally by schema/table
app.get('/api/constraints', async (req, res) => {
    const schema = req.query.schema as string;
    const table = req.query.table as string;
    const results = await fetchContraints(schema, table)
    res.json(results);
});

app.get("*", async (req, res) => {
    res.json({message: 'Bad request!'}).status(404)
})

// app run
app.listen(8000, async function () {
    console.log('App is listening on port 3000!');
});