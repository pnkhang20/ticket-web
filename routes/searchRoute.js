const { Router } = require('express');
const express = require('express');
const router = express.Router();
const controller = require('../controller/searchController');

router.get('/', controller.nhaXe);

module.exports = router;