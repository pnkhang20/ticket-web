const express = require('express');
const route = express.Router();
const controller = require('../controller/aboutUsController');

route.get('/', controller.innitial);

module.exports = route;