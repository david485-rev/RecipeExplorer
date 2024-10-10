const express = require("express");
const app = express();
const cors = require("cors");
const recipeRouter = require("./controllers/recipe-routes.js");
const userRouter = require("./controllers/user-routes.js");
const commentRouter = require("./controllers/comment-routes.js");
const { getDatabaseItem } = require("./service/general-service.js");
const { logger } = require("./util/logger.js");

const PORT = 8888;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
});

app.use("/recipes", recipeRouter);
app.use("/users", userRouter);
app.use("/comments", commentRouter);
app.get("/:uuid", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const item = await getDatabaseItem(uuid);
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ message: "error finding resource" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
