const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    GetCommand
} = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();
const AWS_REGION = process.env.AWS_REGION;

const { logger } = require('../util/logger');

const client = new DynamoDBClient({ region: AWS_REGION });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'RecipeExplorer';

/**
 * 
 * @param {*} uuid 
 * @returns the item from DynamoDB, or null if it does not exist
 */
async function getItemByUuid(uuid) {
    const command = new GetCommand({
        TableName,
        Key: { "uuid": uuid }
    });

    try {
        const data = await documentClient.send(command);

        return data.Item;
    } catch(err) {
        logger.error(err);
        throw new Error(err.message);
    }
}

module.exports = {
    getItemByUuid
}