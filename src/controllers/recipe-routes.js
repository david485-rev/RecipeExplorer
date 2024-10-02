const express = require("express");
const router = express.Router();
const { getRecipes, createRecipe } = require("../service/recipe-service");

router.post("/", async (req, res) => {
  const response = await createRecipe(req.body);
  res.status(response.$metadata.httpStatusCode);
  res.send(response);
});

router.get("/", async (req, res) => {
  const response = await getRecipes();
  res.status(response.$metadata.httpStatusCode);
  res.send(response.Items);
});

module.exports = router;
