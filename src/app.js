const express = require("express");
const app = express();
const recipeRouter = require("./controllers/recipe-routes.js");
const userRouter = require("./controllers/user-routes.js");
const commentRouter = require("./controllers/comment-routes.js");
const { logger } = require("./util/logger.js"); 


const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
});

app.use("/recipes", recipeRouter);
app.use("/users", userRouter);
app.use("/comments", commentRouter)

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

