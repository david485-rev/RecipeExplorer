const express = require('express');
const app = express();
const path = require('path');
const router = require("../src/controllers/profileRouter");
const PORT = 3000;


app.use(express.json());

app.use("/", router);

app.patch("/profile", (req, res) => { });