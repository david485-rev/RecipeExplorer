const express = require("express");
const router = express.Router();
const { logger } = require("../util/logger.js");
const { validateQuery } = require("../util/query_validation.js");
const { authenticateToken } = require("../util/authentication.js");
const { getDatabaseItem } = require("../service/general-service");
const {
  getRecipes,
  createRecipe,
  editRecipe,
  removeRecipe
} = require("../service/recipe-service");

router.get("/", validateQuery, async (req, res) => {
  try {
    const queryKeys = Object.keys(req.query);
    const queryKey = queryKeys[0] || null;
    const queryVal = req.query[queryKey] || null;

    const response = await getRecipes(queryKey, queryVal);

    res.status(response.statusCode);
    res.send(response.data);
  } catch (err) {
    logger.error(err.message);
    res.status(400).send({ message: err.message });
  }
});

router.get("/:uuid", async (req, res) => {
  try {
    const response = await getDatabaseItem(req.params.uuid);
    if (response.type != "recipe") {
      throw new Error("No recipe exists by that uuid");
    }

    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    res.status(400).send({ message: err.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const response = await createRecipe(req.body, req.user.uuid);
    res.status(response.statusCode);
    res.send(response.data);
  } catch (err) {
    logger.error(err.message);
    res.status(400).send({ message: err.message });
  }
});

router.put("/", authenticateToken, async (req, res) => {
  try {
    const response = await editRecipe(req.body, req.user.uuid);
    res.status(response.statusCode);
    res.send(response.data);
  } catch (err) {
    logger.error(err.message);
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:uuid", authenticateToken, async (req, res) => {
  try {
    const response = await removeRecipe(req.params.uuid, req.user.uuid);
    res.status(response.statusCode);
    res.send(response.data);
  } catch (err) {
    logger.error(err.message);
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
