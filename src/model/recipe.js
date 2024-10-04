const uuid = require("uuid");

class Recipe {
  constructor(recipeData) {
    this.uuid = uuid.v4();
    this.creation_date = Math.floor(new Date().getTime() / 1000);
    this.recipe_thumb = recipeData.thumb;
    this.recipe_name = recipeData.recipeName;
    this.type = recipeData.type;
    this.category = recipeData.category;
    this.cuisine = recipeData.cuisine;
    this.description = recipeData.description;
    this.ingredients = recipeData.ingredients;
    this.instructions = recipeData.instructions;
  }
}

module.exports = Recipe;
