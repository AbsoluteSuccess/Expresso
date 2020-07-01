const express = require('express');
const apiRouter = express.Router();

const employeeRouter = require('./employee');
apiRouter.use('/employees', employeeRouter);
const menusRouter = require('./menus');
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;