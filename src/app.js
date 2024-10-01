const express = require('express');
const app = express();
const path = require('path');

const { logger } = require('./util/logger');

const userRoutes = require('../src/controllers/user-routes');

const PORT = 3000;

app.use(express.json());

app.use('/', userRoutes);

app.listen(PORT, () => {
    logger.info(`Server is listening on http://localhost:${PORT}`);
});