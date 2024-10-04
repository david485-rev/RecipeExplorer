const { logger } = require("../util/logger");
const {
  queryRecipes,
  insertRecipe,
  updateRecipe
} = require("../repository/recipe-dao");
const Recipe = require("../model/recipe");

const response = { status: null, body: null };

async function getRecipes() {
  try {
    const recipes = await queryRecipes();
    response.status = recipes.$metadata.httpStatusCode;
    response.body = recipes.Items;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function createRecipe(recipeData) {
  try {
    const newRecipe = new Recipe(recipeData);

    dataValidation(newRecipe);

    const recipe = await insertRecipe(newRecipe);
    response.status = recipe.$metadata.httpStatusCode;
    response.body = recipe;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function editRecipe(recipeData) {
  try {
    dataValidation(recipeData);

    const recipe = await updateRecipe(recipeData);
    response.status = recipe.$metadata.httpStatusCode;
    response.body = recipe.Attributes;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

function dataValidation(data) {
  if (Object.values(data).includes(undefined)) {
    throw new Error("All attributes must be present");
  }
}

module.exports = { getRecipes, createRecipe, editRecipe };
