const uuid = require("uuid");

class Recipe {
  constructor(recipeData, authorId) {
    this.uuid = uuid.v4();
    this.creation_date = Math.floor(new Date().getTime() / 1000);
    this.author_id = authorId;
    this.recipe_thumb = recipeData.recipe_thumb;
    this.recipe_name = recipeData.recipe_name;
    this.type = "recipe";
    this.category = recipeData.category;
    this.cuisine = recipeData.cuisine;
    this.description = recipeData.description;
    this.ingredients = recipeData.ingredients;
    this.instructions = recipeData.instructions;
  }
}

module.exports = Recipe;
