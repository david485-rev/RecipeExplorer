const userDao = require("../repository/user-dao.js");
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../util/logger.js');
const bcrypt = require("bcrypt");

const saltRound = 10;

async function getUserByUsernamePassword(username, password){
    if(username && password){
        const user = await userDao.getUserByUsername(username);
        if(user){
            logger.info(`user ${user.uuid} found`);
            logger.info("" + await bcrypt.hash(password, saltRound))
            if(await bcrypt.compare(password, user.password)){
                
                return {user_id: user.user_id, username: user.username};
            }
        }
    }
    return null;
}

module.exports = {
    getUserByUsernamePassword
}