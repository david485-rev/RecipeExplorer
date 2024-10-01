const { logger } = require('../util/logger.js');

const mockDB = [{ uuid: "1", username: "user1", password: "$2b$10$XAYxnElOwmxOm1WM055U..iD3G.EmISYxiUMCzjGEIlqJSob4wK02"},
    { uuid: "2", username: "user2", password: "$2b$10$GN38azxKWkG.qkykkwAXe.f01bAb1qkBFJpk9BBYYudIeeMljgeuG" }]
    //user1 password is pass1
    //user2 password is pass2
async function getUserByUsername(username) {
    logger.info(`polling database with username: ${username}`);
    for (const key in mockDB) {
        if (mockDB[key].username === username){
            return mockDB[key];
        }         
    }
    return null;
}

module.exports = {
    getUserByUsername
}