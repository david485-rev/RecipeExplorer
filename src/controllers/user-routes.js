const express = require("express");
const { logger } = require('../util/logger.js');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserByUsernamePassword, register, createProfile } = require('../service/user-service.js');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
    try{
        let token = null;
        const account = await getUserByUsernamePassword(req.body.username, req.body.password);
        
        token = jwt.sign({
            uuid: account.uuid,
            username: account.username
        }, secretKey, {
            expiresIn: "7d"
        });
        res.status(200).json({ token });
        return;
    }
    catch (err) {
        logger.error(err);
        res.status(400).json({ message: "no account found" });
        return;
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