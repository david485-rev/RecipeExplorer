const { logger } = require('../util/logger');

const User = require('../model/user');
const { createUser, queryUserByUsername } = require('../repository/user-dao');

async function register(reqBody) {
    const { username, password } = reqBody;

    if(!username) {
        throw new Error('missing username');
    }

    if(!password) {
        throw new Error('missing password');
    }

    const user = await queryUserByUsername(username);

    if(user) {
        throw new Error('user with username already exists!');
    }
    
    const newUser = new User(username, password);

    try {
        const data = await createUser(newUser);
        return data;
    } catch(err) {
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    register,
}