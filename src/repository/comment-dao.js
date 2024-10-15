const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    QueryCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand
} = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();
const AWS_REGION = process.env.AWS_REGION;

const { logger } = require('../util/logger');

const client = new DynamoDBClient({ region: AWS_REGION });
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
        throw new Error(err);
    }
}

async function scanCommentsByRecipeUuid(recipeUuid){
    const command = new ScanCommand({
        TableName,
        FilterExpression: "#r = :r",
        ExpressionAttributeNames: { "#r": "recipeUuid" },
        ExpressionAttributeValues: { ":r": recipeUuid }
    });
    try{
        const data = await documentClient.send(command);
        return data.Items
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function updateComment(uuid, description, rating) {
    const command = new UpdateCommand({
        TableName,
        Key: {
            'uuid': uuid,
        },
        UpdateExpression: 'Set #desc = :desc, #rate = :rate',
        ExpressionAttributeNames: {
            '#desc': 'description',
            '#rate': 'rating'
        },
        ExpressionAttributeValues: {
            ':desc': description,
            ':rate': rating
        },
        ReturnValues: "ALL_NEW"
    });
    try {
        const data = await documentClient.send(command);
        return data.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

async function deleteComment(uuid){
    const command = new DeleteCommand({
        TableName,
        Key:{"uuid": uuid}
    });
    try {
        const data = await documentClient.send(command);
        //logger.info(`Deleted recipe: ${data}`);
        return data;
    }catch (err){
        console.error(err);
        throw new Error(err);
    }
}

async function queryCommentsByAuthorUuidRecipeUuid(authorUuid, recipeUuid) {
    const command = new QueryCommand({
        TableName,
        IndexName: "authorUuid-recipeUuid-index",
        KeyConditionExpression: "#authorUuid = :authorUuid AND #recipeUuid = :recipeUuid",
        ExpressionAttributeNames: {
            "#authorUuid": "authorUuid",
            "#recipeUuid": "recipeUuid"
        },
        ExpressionAttributeValues: {
            ":authorUuid": authorUuid,
            ":recipeUuid": recipeUuid
        }
    })
    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {
    createComment,
    scanCommentsByRecipeUuid,
    updateComment,
    deleteComment,
    queryCommentsByAuthorUuidRecipeUuid
}