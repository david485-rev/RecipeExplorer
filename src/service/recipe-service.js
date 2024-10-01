const { insertRecipe } = require("../repository/recipe-dao");

async function createRecipe(recipe) {
  const newRecipe = await insertRecipe(recipe);
  return newRecipe;
}

module.exports = { createRecipe };
