const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const { logger } = require("../util/logger");

const client = new DynamoDBClient({ region: "us-west-1" });
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
