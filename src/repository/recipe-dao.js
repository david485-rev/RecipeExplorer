const {
  DynamoDBClient,
  ConditionalCheckFailedException
} = require("@aws-sdk/client-dynamodb");
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

async function queryRecipes(queryKey = null, queryVal = null) {
  const commandQuery = {
    TableName,
    IndexName: "type-index",
    KeyConditionExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type"
    },
    ExpressionAttributeValues: {
      ":type": "recipe"
    }
  };

  if (queryKey && queryVal) {
    commandQuery.FilterExpression =
      queryKey === "ingredients"
        ? "contains(#queryKey, :queryVal)"
        : "#queryKey = :queryVal";
    commandQuery.ExpressionAttributeNames["#queryKey"] = queryKey;
    commandQuery.ExpressionAttributeValues[":queryVal"] =
      queryVal.toLowerCase();
  }

  const command = new QueryCommand(commandQuery);

  try {
    const response = await docClient.send(command);
    logger.info("Queried recipes");
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
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
    throw new Error(err);
  }
}

async function updateRecipe(Recipe) {
  const command = new UpdateCommand({
    TableName,
    Key: { uuid: Recipe.uuid },
    UpdateExpression:
      "Set #recipeThumb = :recipeThumb, #recipeName = :recipeName, #category = :category, #cuisine = :cuisine, #description = :description, #ingredients = :ingredients, #instructions = :instructions",
    ExpressionAttributeNames: {
      "#uuid": "uuid",
      "#recipeThumb": "recipeThumb",
      "#recipeName": "recipeName",
      "#category": "category",
      "#cuisine": "cuisine",
      "#description": "description",
      "#ingredients": "ingredients",
      "#instructions": "instructions"
    },
    ExpressionAttributeValues: {
      ":recipeThumb": Recipe.recipeThumb,
      ":recipeName": Recipe.recipeName,
      ":category": Recipe.category,
      ":cuisine": Recipe.cuisine,
      ":description": Recipe.description,
      ":ingredients": Recipe.ingredients,
      ":instructions": Recipe.instructions
    },
    ConditionExpression: "attribute_exists(#uuid)",
    ReturnValues: "ALL_NEW"
  });
  try {
    const response = await docClient.send(command);
    logger.info(`Updated recipe: ${response}`);
    return response;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new Error("The recipe does not exist");
    }
    logger.error(err);
    throw new Error(err);
  }
}

async function deleteRecipe(recipeId, authorId) {
  const command = new DeleteCommand({
    TableName,
    Key: { uuid: recipeId },
    ConditionExpression: "#authorUuid = :authorId",
    ExpressionAttributeNames: { "#authorUuid": "authorUuid" },
    ExpressionAttributeValues: { ":authorId": authorId }
  });
  try {
    const response = await docClient.send(command);
    logger.info(`Deleted recipe: ${response}`);
    return response;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new Error("Author uuid is not valid or does not exist");
    }
    logger.error(err);
    throw new Error(err);
  }
}

module.exports = { queryRecipes, insertRecipe, updateRecipe, deleteRecipe };
