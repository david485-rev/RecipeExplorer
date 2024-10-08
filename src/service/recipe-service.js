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
    validateId(authorId, "author_id");

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
    validateId(authorId, "author_id");

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
    validateId(recipeId, "uuid");

    const recipe = await deleteRecipe(recipeId, authorId);
    response.status = recipe.$metadata.httpStatusCode;
    response.body = recipe;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

function validateId(id, attr) {
  if (!id) {
    response.status = 400;
    response.body = `Missing ${attr}`;
  }
  return response;
}

function dataValidation(data) {
  if (Object.values(data).includes(undefined)) {
    response.status = 400;
    response.body = "Missing attributes";
  }
  return response;
}

module.exports = { getRecipes, createRecipe, editRecipe, removeRecipe };
