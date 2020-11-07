import express = require('express');
import bodyParser from "body-parser";
import {listTables, listColumns, listContraints} from "./db";

// Create a new express app instance
const app: express.Application = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


app.get('/api/tables', async (req, res) =>  {
    const tbs = await listTables()
    res.json(tbs);
});

app.get('/api/tables/table', async (req, res) => {
    console.log()
    const cols = await listColumns('public', 'address')
    res.json(cols);
});

app.get('/api/constraints', async (req, res) => {
    const results = await listContraints('public')
    res.json(results);
});


app.listen(3000, async function () {

    
    const constraints = await listContraints('public')
    // console.log("server get tbs: ", tbs)
    console.log('App is listening on port 3000!');
});