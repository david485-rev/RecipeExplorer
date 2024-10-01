const express = require("express");
const app = express();
const recipesController = require("./controllers/RecipesController");
const logger = require("./util/logger");
const PORT = 3000;
const path = require("path");

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
});

app.use("/recipes", recipesController);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
