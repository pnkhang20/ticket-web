'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../controller/adminController');

//logout
router.get('/logout', controller.isAdminLoggedIn, controller.logout);

// select
router.get('/',controller.isAdminLoggedIn, controller.getNhaXes);
router.get('/NhaXe',controller.isAdminLoggedIn, controller.getNhaXes);
router.get('/ChuyenXe',controller.isAdminLoggedIn, controller.getChuyenXes);
router.get('/DatVe',controller.isAdminLoggedIn, controller.getVes);

//show 
router.get('/ChuyenXe/CreateCX',controller.isAdminLoggedIn, controller.showCreateCX);
router.get('/NhaXe/CreateNX',controller.isAdminLoggedIn, controller.showCreateNX);
router.get('/ChuyenXe/:id',controller.isAdminLoggedIn, controller.showEditChuyenXe);
router.get('/NhaXe/:id', controller.isAdminLoggedIn, controller.showEditNhaXe);
router.get('/DatVe/:id/:idUser/:idChuyenXe', controller.isAdminLoggedIn, controller.showDetailVeXe)


//create
router.post('/ChuyenXe/CreateCX',controller.isAdminLoggedIn, controller.createCX);
router.post('/NhaXe/CreateNX',controller.isAdminLoggedIn, controller.createNX);

//edit
router.post('/ChuyenXe/EditCX/:id',controller.isAdminLoggedIn, controller.editCX);
router.post('/NhaXe/EditNX/:id',controller.isAdminLoggedIn, controller.editNX);

//delete
router.get('/ChuyenXe/delete/:id',controller.isAdminLoggedIn, controller.deleteCX);
router.get('/NhaXe/delete/:id',controller.isAdminLoggedIn, controller.deleteNX);
module.exports = router;