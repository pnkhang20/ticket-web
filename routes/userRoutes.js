const express = require('express');
const router = express.Router();
const controller = require('../controller/userController');

router.get('/', (req, res) => res.redirect('/user/userinfo'));
router.get('/userinfo', controller.isLoggedIn, controller.showProfile);
router.get('/tickets', controller.isLoggedIn, controller.showTicket);
router.get('/changePass',controller.isLoggedIn, controller.showChangePass);
router.get('/logout', controller.isLoggedIn, controller.logout);

router.get('/cancel/:id', controller.isLoggedIn, controller.cancelTicket);
router.get('/comment/trip/:id', controller.isLoggedIn, controller.showCommentPage);

router.post('/changePass', controller.isLoggedIn, controller.changePassword);
router.post('/changeInfo', controller.isLoggedIn, controller.changeInfo);

router.post('/comment/:id', controller.isLoggedIn, controller.submitComment);

router.get('/payment/:id/:pay/:seats', controller.isLoggedIn, controller.showPayment);
router.get('/pay/:idCX/:idUser/:seats/:soVe/:tongTien', controller.isLoggedIn, controller.proceedBooking);
module.exports = router;