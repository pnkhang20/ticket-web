'use strict';
const express = require('express')
const router = express.Router()
const controller = require('../controller/nhaXeController')

//Create
router.post("/", controller.createNhaXe);
//Update
router.put("/:id", controller.updateNhaXe);
//Delete
router.delete("/:id", controller.deleteNhaXe);
//Get
router.get("/:id", controller.getNhaXe);
//Get all
router.get("/", controller.getAllNhaXe);

module.exports = router;