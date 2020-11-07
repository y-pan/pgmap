import express = require('express');
import bodyParser from "body-parser";
import {fetchSchemas, fetchTablesBySchema, fetchColumnsByTable, fetchContraints} from "./db";

const app: express.Application = express();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// routes
// list schemas
app.get('/api/schemas', async (req, res) => {
    const schemas = await fetchSchemas()
    res.json(schemas)
});

// list tables of a schema
app.get('/api/schemas/:schema', async (req, res) =>  {
    const schema = req.params.schema || 'public'
    const tables = await fetchTablesBySchema(schema)
    res.json(tables);
});

// list columns of a table
app.get('/api/schemas/:schema/:table', async (req, res) => {
    const schema = req.params.schema || 'public'
    const table = req.params.table
    const cols = await fetchColumnsByTable(schema, table)
    res.json(cols);
});

// list constraints of a table
app.get('/api/schemas/:schema/:table/constraints', async (req, res) => {
    const schema = req.params.schema
    const table = req.params.table
    const results = await fetchContraints(schema, table)
    res.json(results);
});

// list all constraints. Not useful in practical
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
app.listen(3000, async function () {
    console.log('App is listening on port 3000!');
});