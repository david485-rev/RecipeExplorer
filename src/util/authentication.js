const express = require("express");
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");


async function authenticateToken(req, res, next){

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        res.status(401).json({message: "Unauthorized Access"});
    }else{
        const user = await decodeJWT(token);
        req.user = user;
        next();
    }
}

async function decodeJWT(token){
    try{
        const user = await jwt.verify(token, secretKey)
        return user;
    }catch(err){
        console.error(err);
    }
}


module.exports = {
    authenticateToken
  };
  