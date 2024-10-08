const { logger } = require("../util/logger");
const {
  queryRecipes,
  insertRecipe,
  updateRecipe,
  deleteRecipe
} = require("../repository/recipe-dao");
const Recipe = require("../model/recipe");

const response = { status: null, body: null };

async function getRecipes() {
  try {
    const recipes = await queryRecipes();

    if (!recipes.Items.length) {
      response.status = 404;
      response.body = "Recipes not found";
      return response;
    }

    response.status = recipes.$metadata.httpStatusCode;
    response.body = recipes.Items;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function createRecipe(recipeData, authorId) {
  try {
    const newRecipe = new Recipe(recipeData, authorId);

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

async function editRecipe(recipeData, authorId) {
  try {
    if (authorId != recipeData.author_id) {
      response.status = 403;
      response.message =
        "Only the recipe author is allowed to edit this recipe";
      return response;
    }

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

async function removeRecipe(recipeId, authorId) {
  try {
    if (!recipeId) {
      response.status = 400;
      response.body = "Missing recipe id (uuid)";
      return response;
    }

    const recipe = await deleteRecipe(recipeId, authorId);
    response.status = recipe.$metadata.httpStatusCode;
    response.body = recipe;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

function dataValidation(data) {
  if (Object.values(data).includes(undefined)) {
    response.status = 400;
    response.body = "Missing attributes.";
    return response;
  }
}

module.exports = { getRecipes, createRecipe, editRecipe, removeRecipe };
