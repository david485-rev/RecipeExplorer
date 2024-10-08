const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../util/authentication.js");
const { getDatabaseItem } = require("../service/general-service");
const {
  getRecipes,
  createRecipe,
  editRecipe,
  removeRecipe
} = require("../service/recipe-service");

router.get("/", async (req, res) => {
  const response = await getRecipes();
  res.status(response.status);
  res.send(response.body);
});

router.get("/:uuid", async (req, res) => {
  const response = await getDatabaseItem(req.params.uuid);
  res.status(response.$metadata.httpStatusCode);
  res.send(response);
});

router.post("/", authenticateToken, async (req, res) => {
  const authorId = req.user.uuid;
  const response = await createRecipe(req.body, authorId);
  res.status(response.status);
  res.send(response.body);
});

router.put("/", authenticateToken, async (req, res) => {
  const authorId = req.user.uuid;
  const response = await editRecipe(req.body, authorId);
  res.status(response.status);
  res.send(response.body);
});

router.delete("/:uuid", authenticateToken, async (req, res) => {
  const authorId = req.user.uuid;
  const response = await removeRecipe(req.params.uuid, authorId);
  res.status(response.status);
  res.send(response.body);
});

module.exports = router;
