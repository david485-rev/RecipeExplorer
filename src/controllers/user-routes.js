const express = require("express");
const { logger } = require('../util/logger.js');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserByUsernamePassword, register, createProfile } = require('../service/user-service.js');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
    // logger.info(req.body.username);
    // logger.info(req.body.password);
    let token = null;
    if(req.body){
        if (req.body.username && req.body.password) {
            const account = await getUserByUsernamePassword(req.body.username, req.body.password);
            if(account){
                token = jwt.sign({
                    uuid:account.uuid,
                    username: account.username
                }, secretKey, {
                    expiresIn: "7d"
                });
            } 
        }
    }
    if(token){
        return res.status(200).json({token});
    }
    else{
        res.status(400).json({message: "no account found"});
    }
})
router.post('/register', async function(req, res, next) {
        try {
            await register(req.body);

            res.status(201).json({ message: 'User successfully registered!' });
        } catch(err) {
            logger.error(err.message);
            res.status(400).json({ message: err.message });
            return;
        }
    })

router.patch("/profile", async(req, res) => {
    try{
        const data = await createProfile(req.body);
        res.status(201).json({message: 'Successfully updated'});
    } catch(err) {
        logger.error(err.message);
        res.status(400).json({message: err.message});
        
    }

}) 


module.exports = router;