'use strict';
const express = require('express')
const router = express.Router()
const controller = require('../controller/vexeController')

//Create
router.post("/:VeXeId", controller.createVeXe);
//Update
router.put("/:id", controller.updateVeXe);
//Delete
router.delete("/:id", controller.deleteVeXe);
//Get
router.get("/:id", controller.getVeXe);
//Get all
router.get("/", controller.getAllVeXe);

module.exports = router;