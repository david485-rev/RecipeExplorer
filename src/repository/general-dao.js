const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    QueryCommand
} = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();
const AWS_REGION = process.env.AWS_REGION;

const { logger } = require('../util/logger');

const client = new DynamoDBClient({ region: AWS_REGION });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'RecipeExplorer';

async function queryByUuid(uuid){
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: "#uuid = :uuid",
        ExpressionAttributeNames: { "#uuid": "uuid" }, 
        ExpressionAttributeValues: { ":uuid": uuid }
    });
    try{
        const data = await documentClient.send(command);
        if (data.Items) {
            return data.Items[0];
        }
        return null;
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    queryByUuid
}