const uuid = require("uuid");

class Recipe {
  constructor(recipeData, authorId) {
    this.uuid = uuid.v4();
    this.creationDate = Math.floor(new Date().getTime() / 1000);
    this.authorUuid = authorId;
    this.recipeThumb = recipeData.recipeThumb;
    this.recipeName = recipeData.recipeName;
    this.type = "recipe";
    this.category = recipeData.category.toLowerCase();
    this.cuisine = recipeData.cuisine.toLowerCase();
    this.description = recipeData.description;
    this.ingredients = recipeData.ingredients;
    this.instructions = recipeData.instructions;
  }
}

module.exports = Recipe;
