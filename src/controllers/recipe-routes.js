const express = require("express");
const router = express.Router();
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

router.post("/", async (req, res) => {
  const response = await createRecipe(req.body);
  res.status(response.status);
  res.send(response.body);
});

router.put("/", async (req, res) => {
  const response = await editRecipe(req.body);
  res.status(response.status);
  res.send(response.body);
});

router.delete("/:uuid", async (req, res) => {
  const response = await removeRecipe(req.param.uuid);
  res.status(response.status);
  res.send(response.body);
});

module.exports = router;
