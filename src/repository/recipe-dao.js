const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const logger = require("../util/logger");
const uuid = require("uuid");

const client = new DynamoDBClient({ region: "us-west-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TableName = "Recipes";
let recipeId = uuid.v4();

async function insertRecipe(recipe) {
  const command = new PutCommand({
    TableName,
    Item: {
      ...recipe,
      recipeId: recipeId
    }
  });
  try {
    const response = await docClient.send(command);
    logger.info(`Created recipe: ${JSON.stringify(response)}`);
    return response;
  } catch (err) {
    logger.error(err);
  }
}

module.exports = { insertRecipe };
