const { logger } = require('../util/logger');
const bcrypt = require("bcrypt");
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const User = require('../model/user');
const { getItemByUuid } = require('../repository/general-dao');
const { getDatabaseItem } = require("../service/general-service");
const { createUser, 
    queryUserByUsername, 
    queryEmail, 
    postProfile, 
    patchPassword, 
    deleteUser, 
    queryRecipesByAuthorUuid,
    queryAllByAuthorUuid 
} = require('../repository/user-dao');

const saltRounds = 10;

async function register(reqBody) {
    const { username, password, email, description, picture } = reqBody;

    if(!username) {
        throw new Error('missing username');
    }

    if(!password) {
        throw new Error('missing password');
    }

    if(!email) {
        throw new Error('missing email');
    }

    const user = await queryUserByUsername(username);

    if(user) {
        throw new Error('user with username already exists!');
    }

    const email_exists = await queryEmail(email);

    if(email_exists) {
        throw new Error('email used already');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = new User(username, hashedPassword, email, description, picture);

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

        if(!user) {
            throw new Error('no account found');
        }

        if (await bcrypt.compare(password, user.password)) {
            return { uuid: user.uuid, username: user.username};
        }
            
    }catch(err){
        logger.error(err);
        throw new Error(err.message);
    }
}

async function passwordChange(item, uuid) {
    const user = await getItemByUuid(uuid);
    if(!item.newPassword) {
        throw new Error("New password can not be empty")
    }
    try{
        if(await bcrypt.compare(item.password, user.password)){
            let cryptPassword = await bcrypt.hash(item.newPassword, saltRounds);
            let data = await patchPassword(cryptPassword, uuid);
            return data; 
        } else throw new Error("password is not correct")
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function createProfile(item, uuid) {
    if(!item.username) {
        throw new Error('missing username');
    }
    if(!item.email) {
        throw new Error('missing email');
    }
    const userNameData = await queryUserByUsername(item.username);
    const userEmailData = await queryEmail(item.email);
    const userPersonalData = await getItemByUuid(uuid);
    if(userPersonalData.username != item.username && userNameData) {
        throw new Error('user with this username already exists!');
    }
    if(userPersonalData.email != item.email && userEmailData) {
        throw new Error('this email already exist')
    }

    try{
        let data = await postProfile({
        ...item
        },
        uuid
        );
        return data;
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function removeUser(reqParams) {
    const { uuid } = reqParams;

    if(!uuid) {
        throw new Error('uuid missing');
    }

    try {
        const data = await deleteUser(uuid);

        return data;
    } catch(err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function getRecipesByAuthorUuid(uuid){
    if(!uuid){
        throw new Error("uuid missing");
    }
    try{
        const data = await queryRecipesByAuthorUuid(uuid);
        return data;
    } catch(err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function getRecipesCommentsByAuthorUuid(uuid) {
    if (!uuid) {
        throw new Error("uuid missing");
    }
    try {
        const data = await queryAllByAuthorUuid(uuid);
        return data;
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function getUserByToken(uuid) {
    if (!uuid) {
        throw new Error('uuid missing');
    }

    try {
        const data = await getDatabaseItem(uuid);
        if(data.type === 'user'){
            return data;
        }
        throw new Error('uuid does not point to user');
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    register,
    getUserByUsernamePassword,
    createProfile,
    passwordChange,
    removeUser,
    getRecipesCommentsByAuthorUuid,
    getRecipesByAuthorUuid,
    getUserByToken
}
