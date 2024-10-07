const { logger } = require('../util/logger');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const User = require('../model/user');
const { createUser, queryUserByUsername, postProfile, patchPassword, deleteUser} = require('../repository/user-dao');

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
        if (await bcrypt.compare(password, user.password)) {
            return { uuid: user.uuid, username: user.username, creation_date: user.creation_date};
        }
            
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function getInfoProfile(item) {
   try{
    let data = queryByUuid(item);
     return data;
   }catch(err){
    logger.error(err);
    throw new Error(err); 
   }  
}

async function passwordChange(item, uuid, creation_date) {
    const user = await queryByUuid(uuid);
    if(!item.newPassword) {
        throw new error("New password can not be empty")
    }
    try{
        if(await bcrypt.compare(item.password, user.password)){
            let cryptPassword = await bcrypt.hash(item.newPassword, saltRounds);
            let data = patchPassword(cryptPassword, uuid, creation_date);
            return data; 
        } else throw new error("password is not correct")
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function createProfile(item, uuid, creation_date) {
    try{
        let data = await postProfile({
        ...item
        },
        uuid,
        creation_date
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
        throw new Error(err);
    }
}

module.exports = {
    register,
    getUserByUsernamePassword,
    createProfile,
    getInfoProfile,
    passwordChange,
    removeUser
}