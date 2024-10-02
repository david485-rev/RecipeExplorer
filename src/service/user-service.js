const { logger } = require('../util/logger');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

const User = require('../model/user');
const { createUser, queryUserByUsername, patchProfile, quaryByUuid } = require('../repository/user-dao');

const saltRounds = 10;

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

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = new User(username, hashedPassword);

    try {
        const data = await createUser(newUser);
        return data;
    } catch(err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function getUserByUsernamePassword(username, password){
    if(!username){
        throw new Error('missing username');
    }
    if(!password){
        throw new Error('missing password');
    }
    try{
        const user = await queryUserByUsername(username);
        if (await bcrypt.compare(password, user.password)) {
            return { uuid: user.uuid, username: user.username };
        }
        //logger.info(`user ${user.uuid} found`);
        // logger.info("" + await bcrypt.hash(password, saltRound))
        // if(await bcrypt.compare(password, user.password)){

        //     return {user_id: user.user_id, username: user.username};
            
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function getInfoProfile(item) {
   try{
    let data = quaryByUuid(item);
    return data;
   }catch(err){
    logger.error(err);
    throw new Error(err); 
   }  
}

async function createProfile(item, uuid) {
    try{
        let data = await patchProfile({
        ...item,
        uuid 
        });
        return data;
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    register,
    getUserByUsernamePassword,
    createProfile,
    getInfoProfile
}