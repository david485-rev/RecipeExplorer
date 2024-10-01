const express = require('express');
const router = express.Router();

const { logger } = require('../util/logger');

const { register } = require('../service/user-service');

router.route('/register')
    .post(async function(req, res, next) {
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