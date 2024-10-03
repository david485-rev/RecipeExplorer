const { logger } = require("../util/logger");
const { queryRecipes, insertRecipe } = require("../repository/recipe-dao");
const Recipe = require("../model/recipe");

async function getRecipes() {
  try {
    const recipes = await queryRecipes();
    return recipes;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function createRecipe(recipeData) {
  try {
    const newRecipe = new Recipe(recipeData);
    const recipe = await insertRecipe(newRecipe);
    return recipe;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

module.exports = { getRecipes, createRecipe };
