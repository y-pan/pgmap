import express = require('express');
import bodyParser from "body-parser";
import {fetchTables, fetchColumns, fetchContraints} from "./db";

// Create a new express app instance
const app: express.Application = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


app.get('/api/tables', async (req, res) =>  {
    const tbs = await fetchTables()
    res.json(tbs);
});

app.get('/api/tables/:table', async (req, res) => {
    const table = req.params['table']
    const cols = await fetchColumns('public', table)
    res.json(cols);
});

app.get('/api/constraints/:table', async (req, res) => {
    const table = req.params['table'] || ''
    const results = await fetchContraints('public', table)
    res.json(results);
});

app.get('/api/constraints', async (req, res) => {
    const results = await fetchContraints('public', undefined)
    res.json(results);
});

app.listen(3000, async function () {
    console.log('App is listening on port 3000!');
});