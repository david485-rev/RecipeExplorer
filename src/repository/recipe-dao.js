const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();
const AWS_REGION = process.env.AWS_REGION;
const { logger } = require("../util/logger");

const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TableName = "RecipeExplorer";

async function queryRecipes() {
  const command = new QueryCommand({
    TableName,
    IndexName: "type-index",
    KeyConditionExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type"
    },
    ExpressionAttributeValues: {
      ":type": "recipe"
    }
  });
  try {
    const response = await docClient.send(command);
    logger.info("Queried recipes");
    return response;
  } catch (err) {
    logger.error(err);
  }
}

async function insertRecipe(Recipe) {
  const command = new PutCommand({
    TableName,
    Item: Recipe
  });
  try {
    const response = await docClient.send(command);
    logger.info(`Created recipe: ${JSON.stringify(response)}`);
    return response;
  } catch (err) {
    logger.error(err);
  }
}

async function updateRecipe(Recipe) {
  const command = new UpdateCommand({
    TableName,
    Key: { uuid: Recipe.uuid },
    UpdateExpression:
      "Set #recipe_thumb = :recipe_thumb, #recipe_name = :recipe_name, #type = :type, #category = :category, #cuisine = :cuisine, #description = :description, #ingredients = :ingredients, #instructions = :instructions",
    ExpressionAttributeNames: {
      "#recipe_thumb": "recipe_thumb",
      "#recipe_name": "recipe_name",
      "#type": "type",
      "#category": "category",
      "#cuisine": "cuisine",
      "#description": "description",
      "#ingredients": "ingredients",
      "#instructions": "instructions"
    },
    ExpressionAttributeValues: {
      ":recipe_thumb": Recipe.recipe_thumb,
      ":recipe_name": Recipe.recipe_name,
      ":type": "recipe",
      ":category": Recipe.category,
      ":cuisine": Recipe.cuisine,
      ":description": Recipe.description,
      ":ingredients": Recipe.ingredients,
      ":instructions": Recipe.instructions
    },
    ReturnValues: "ALL_NEW"
  });
  try {
    const response = await docClient.send(command);
    logger.info(`Updated recipe: ${response}`);
    return response;
  } catch (err) {
    logger.error(err);
  }
}

async function deleteRecipe(recipeId) {
  const command = new DeleteCommand({
    TableName,
    Key: { uuid: recipeId }
  });
  try {
    const response = await docClient.send(command);
    logger.info(`Deleted recipe: ${response}`);
    return response;
  } catch (err) {
    logger.error(err);
  }
}

module.exports = { queryRecipes, insertRecipe, updateRecipe, deleteRecipe };
