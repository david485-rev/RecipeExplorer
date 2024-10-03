const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");
require('dotenv').config();
const AWS_REGION = process.env.AWS_REGION;
const { logger } = require("../util/logger");

const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TableName = "RecipeExplorer";

async function queryRecipes() {
  const command = new QueryCommand({
    TableName,
    IndexName: "type-creation_date-index",
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

module.exports = { queryRecipes, insertRecipe };
