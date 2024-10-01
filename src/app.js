const express = require('express');
const app = express();
const path = require('path');
const router = require("./controllers/user-routes.js");
const logger = require("../src/util/logger");
const PORT = 3000;


app.use(express.json());

app.use("/", router);

app.patch("/profile", (req, res) => { });

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});