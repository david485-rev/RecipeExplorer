const express = require("express");
const { logger } = require('../util/logger.js');
const { getSecretKey } = require('../constants.js');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserByUsernamePassword } = require('../service/user-service.js');

const secretKey = getSecretKey();

router.post("/login", async (req, res) => {
    //logger.info("");
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
router.post(async function(req, res, next) {
        try {
            await register(req.body);

            res.status(202).json({ message: 'User successfully registered!' });
        } catch(err) {
            logger.error(err.message);
            res.status(400).json({ message: err.message });
            return;
        }
    })

module.exports = router;