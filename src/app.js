const express = require("express");
const app = express();
const recipesController = require("./controllers/recipe-routes.js");
const path = require('path');

const userRouter = require("./controllers/user-routes.js");
const { logger } = require("./util/logger.js"); 

const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Incoming ${req.method} : ${req.url}`);
    next();
});

app.use("/recipes", recipesController);
app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});

