'use strict';
const express = require('express')
const router = express.Router()
const controller = require('../controller/chuyenXeController')

//Create
router.post("/:nhaXeId", controller.createChuyenXe);
//Update
router.put("/:id", controller.updateChuyenXe);
//Delete
router.delete("/:id", controller.deleteChuyenXe);
//Get
router.get("/:id", controller.getChuyenXe);
//Get all
router.get("/", controller.getAllChuyenXe);

module.exports = router;