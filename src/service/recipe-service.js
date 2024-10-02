const { queryRecipes, insertRecipe } = require("../repository/recipe-dao");
const Recipe = require("../model/recipe");

async function createRecipe(recipeData) {
  const newRecipe = new Recipe(recipeData);
  const recipe = await insertRecipe(newRecipe);
  return recipe;
}

async function getRecipes() {
  const recipes = await queryRecipes();
  return recipes;
}

module.exports = { getRecipes, createRecipe };
