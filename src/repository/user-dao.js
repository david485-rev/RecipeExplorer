const { DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand
} = require("@aws-sdk/lib-dynamodb")
const logger = require("../util/logger")
const client = new DynamoDBClient({region: "us-east-2"});

const documentClient = DynamoDBDocumentClient.from(client);


async function patchProfile(item) {
    const command = new UpdateCommand({
        TableName: "Profile_table",
        Key: {
            'userID':item.userID
          },
          UpdateExpression: 'Set #email = :email, #userName = :userName, #picture = :picture, #description = :description',
          ExpressionAttributeNames: {
            '#email': 'email',
            '#userName': 'userName',
            '#picture': 'picture',
            '#description': 'description'
          },
          ExpressionAttributeValues: {
            ':email': item.email,
            ':userName': item.userName,
            ':picture': item.picture,
            ':description': item.description
          },
          ReturnValues: "ALL_NEW"
    });
    try{
        const data = await documentClient.send(command);    
        return data;
    }catch(err){
        console.error(err);
    }

}

module.exports = {
    patchProfile
}