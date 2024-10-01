const express = require("express");
const router = express.Router();
const { createRecipe } = require("../service/recipe-service");

router.post("/", async (req, res) => {
  let response = await createRecipe(req.body);
  res.status(response.$metadata.httpStatusCode);
  res.send(response);
});

module.exports = router;
