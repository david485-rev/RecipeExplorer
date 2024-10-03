const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const { logger } = require('../util/logger');
require('dotenv').config();
const region = process.env.AWS_REGION;
const client = new DynamoDBClient({ region: region });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'RecipeExplorer';

async function createComment(comment) {
    const command = new PutCommand({
        TableName,
        Item: comment
    });
    try {
        const data = await documentClient.send(command);
        return data;
    } catch (err) {
        logger.error(err);
        throw new Error(err)
    }
}

async function queryCommentByUuid(uuid){
    const command = new QueryCommand({
        KeyConditionExpression: "#uuid = :uuid",
        ExpressionAttributeNames: { "#id": "uuid" },
        ExpressionAttributeValues: { ":id": uuid }
    });
    try{
        const data = await documentClient.send(command);
        if (data.Items.length === 0) {
            return false;
        }
        return data.Items[0];
    }catch(err){
        logger.error(err);
        throw new Error(err)
    }
}

module.exports = {
    queryCommentByUuid,
    createComment
}