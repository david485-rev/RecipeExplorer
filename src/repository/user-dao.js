const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
    QueryCommand
} = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();
const AWS_REGION = process.env.AWS_REGION;

const { logger } = require('../util/logger');

const client = new DynamoDBClient({ region: AWS_REGION });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'RecipeExplorer';

async function createUser(User) {
    const command = new PutCommand({
        TableName,
        Item: User
    });

    try {
        const data = await documentClient.send(command);
        return data;
    } catch (err) {
        logger.error(err);
        throw new Error(err)
    }
}

/**
 * 
 * @param {string} username - a username to search for a User with
 * @returns a User with username, or false if no such User exists
 */
async function queryUserByUsername(username) {
    const command = new QueryCommand({
        TableName,
        IndexName: 'username-index',
        KeyConditionExpression: '#username = :u',
        ExpressionAttributeNames: { '#username': 'username' },
        ExpressionAttributeValues: { ':u': username }
    });

    try {
        const data = await documentClient.send(command);

        if (data.Items.length === 0) {
            return false;
        }

        return data.Items[0];
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function queryEmail(email) {
    const command = new QueryCommand({
        TableName,
        IndexName: 'email-index',
        KeyConditionExpression: '#email = :e',
        ExpressionAttributeNames: { '#email': 'email' },
        ExpressionAttributeValues: { ':e': email }
    });

    try {
        const data = await documentClient.send(command);

        if (data.Items.length === 0) {
            return false;
        }

        return data.Items[0];
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

// update password
async function patchPassword(item, uuid) {
    const command = new UpdateCommand({
        TableName: "RecipeExplorer",
        Key: {
            'uuid': uuid
        },
        UpdateExpression: 'Set #password = :password',
        ExpressionAttributeNames: {
            '#password': 'password'
        },
        ExpressionAttributeValues: {
            ':password': item
        },
    });
    try {
        const data = await documentClient.send(command);
        return data;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

// update profile
async function postProfile(item, uuid) {
    const command = new UpdateCommand({
        TableName: "RecipeExplorer",
        Key: {
            'uuid': uuid
        },
        UpdateExpression: 'Set #email = :email, #username = :username, #picture = :picture, #description = :description',
        ExpressionAttributeNames: {
            '#email': 'email',
            '#username': 'username',
            '#picture': 'picture',
            '#description': 'description'
        },
        ExpressionAttributeValues: {
            ':email': item.email,
            ':username': item.username,
            ':picture': item.picture,
            ':description': item.description
        },
        ReturnValues: "ALL_NEW"
    });
    try {
        const data = await documentClient.send(command);
        return data;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

}

// change name
// make sure they cant login
async function deleteUser(uuid) {
    const command = new UpdateCommand({
        TableName,
        Key: { "uuid": uuid },
        UpdateExpression: "set #username = :u remove #password, #email, #description, #picture",
        ExpressionAttributeNames: {
            "#username": "username",
            "#password": "password",
            "#email": "email",
            "#description": "description",
            "#picture": "picture"
        },
        ExpressionAttributeValues: {
            ":u": `deleted-user${uuid}`
        },
    });

    try {
        const data = await documentClient.send(command);
    } catch(err) {
        throw new Error(err);
    }
}

async function queryRecipesByAuthorUuid(uuid){
    const command = new QueryCommand({
        TableName,
        IndexName: 'authorUuid-index',
        KeyConditionExpression: '#authorUuid = :authorUuid',
        FilterExpression: '#type = :type',
        ExpressionAttributeNames: { '#authorUuid': 'authorUuid',
            '#type':'type'    
        },
        ExpressionAttributeValues: { ':authorUuid': uuid,
            ':type':'recipe'
        }
    });
    try{
        const data = await documentClient.send(command);
        if (data.$metadata.httpStatusCode !== 200) {
            throw new Error("database error");
        }
        return data.Items;
    } catch(err) {
        logger.error(err);
        throw new Error(err);
    }
}
async function queryAllByAuthorUuid(uuid) {
    const command = new QueryCommand({
        TableName,
        IndexName: 'authorUuid-index',
        KeyConditionExpression: '#authorUuid = :authorUuid',
        ExpressionAttributeNames: {
            '#authorUuid': 'authorUuid'
        },
        ExpressionAttributeValues: {
            ':authorUuid': uuid
        }
    });
    try {
        const data = await documentClient.send(command);
        if (data.$metadata.httpStatusCode !== 200) {
            throw new Error("database error");
        }
        return data.Items;
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    createUser,
    queryUserByUsername,
    queryEmail,
    postProfile,
    patchPassword,
    deleteUser,
    queryRecipesByAuthorUuid,
    queryAllByAuthorUuid
}
