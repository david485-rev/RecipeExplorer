const { insertRecipe } = require("../dao/recipesDAO");

async function createRecipe(recipe) {
  const newRecipe = await insertRecipe(recipe);
  return newRecipe;
}

module.exports = { createRecipe };
