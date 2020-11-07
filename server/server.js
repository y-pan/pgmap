"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
// Create a new express app instance
const app = express();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.get('/api/tables', async (req, res) => {
    const tbs = await db_1.listTables();
    res.json(tbs);
});
app.get('/api/tables/table', async (req, res) => {
    console.log();
    const cols = await db_1.listColumns('public', 'address');
    res.json(cols);
});
app.get('/api/constraints', async (req, res) => {
    const results = await db_1.listContraints('public');
    res.json(results);
});
app.listen(3000, async function () {
    const constraints = await db_1.listContraints('public');
    // console.log("server get tbs: ", tbs)
    console.log('App is listening on port 3000!');
});
