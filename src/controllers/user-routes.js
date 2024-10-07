const express = require("express");
const { logger } = require('../util/logger.js');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserByUsernamePassword, register, createProfile, getInfoProfile, decodeJWT} = require('../service/user-service.js');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;;

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


router.get("/profile", async(req, res)=> {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        res.status(401).json({message: "Unauthorized Access"});
    } else{
        const user = await decodeJWT(token);
        req.user = user;
        try{
            const data = await getInfoProfile(user.uuid);
            res.status(200).json(data);
        }catch(err){
            logger.error(err.message);
            res.status(400).json({message: err.message});
        }
    }
})

router.post("/profile", async(req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token){
        res.status(401).json({message: "Unauthorized Access"});
    } else{
        const user = await decodeJWT(token);
        req.user = user;
        const userInfo = await getInfoProfile(user.uuid);
        try{
            const data = await createProfile(req.body, user.uuid, userInfo.creation_date);
            res.status(201).json({message: 'Successfully updated'});
        } catch(err) {
            logger.error(err.message);
            res.status(400).json({message: err.message});
            
        }  
    }

}) 


module.exports = router;