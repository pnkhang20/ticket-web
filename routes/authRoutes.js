'use strict';
require("dotenv").config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controller/authController');
const { body, showErrorMessageIfAvailable } = require('../controller/validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/taikhoan');


// Define transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error){
        console.log(error);
    }
    else {
        console.log("ready for message");
    }
})

// CHANGE PASSWORD 
router.get('/forgetPass', controller.showForgetPass);

router.post('/SendMail', controller.sendMail);
router.post('/ResetPass', controller.resetPassword);

// router.post('/changePass', controller.isLoggedIn,
//     body('oldPassword').trim().notEmpty().withMessage('Old Password can not be empty.'),
//     body('password').trim().notEmpty().withMessage('Password can not be empty.'),
//     body('password').matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/).withMessage('Password must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters'),
//     body('confirmPassword').custom((confirmPassword, { req }) => {
//         if (confirmPassword !== req.body.password) {
//             throw new Error('Password confirmation does not match password');
//         }
//         return true;
//     }),
//     showErrorMessageIfAvailable('user'),
//     controller.changePassword
// )
// LOGOUT 
router.get('/logout', controller.logout);

// LOGIN 
router.get('/Signin', controller.showLogin);
router.post("/Signin",
    body('email')
        .trim().notEmpty().withMessage('Email can not be empty.')
        .isEmail().withMessage('Invalid Email address.'),
    body('password')
        .trim().notEmpty().withMessage('Password can not be empty.'),
    showErrorMessageIfAvailable('Signin'),
    (req, res, next) => {
        passport.authenticate('local-login', {
            successRedirect: "/", // chuyen huong den trang web sau khi dang nhap thanh cong
            failureRedirect: `/auth/Signin?reqUrl=/`, // chuyen huong den trang web khi co loi 
            failureFlash: true // cho phep su dung flash messages
        })(req, res, next);
    }
);

// SIGNUP =================================
const sendVerificationEmail = ({_id, email}, res)=>{
    const curUrl = "http://localhost:5000/";
    // const uniqueString = uuidv4() + _id;
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your email",
        html: `<p>Verify your email address to complete the signup 
        and login into your account.</p>
        <p>This link<b> expires in 6 hours</b>.</p><p>Press <a href =${
            curUrl + "auth/" + _id
        }>here</a> to proceed.</p>`,
    };
    transporter.sendMail(mailOptions);

} 
router.get('/Signup', controller.showRegister);
router.post('/Signup', (req, res)=>{
    let {email, phone, password, confirmPassword} = req.body;
    email = email.trim();
    phone = phone.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();
    if (email == "" || phone == "" || password == "" || confirmPassword == "" ){        
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });        
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email entered",
          });
    } else if (password.length < 6){
        res.json({
            status: "FAILED",
            message: "Password is too short!",
          });
    } else if (password != confirmPassword){
        res.json({
            status: "FAILED",
            message: "Confirm Password doesn't match!",
          });
    } else if (phone.length < 10){
        res.json({
            status: "FAILED",
            message: "Phone number must be greater than 9 digits!",
          });
    } else {
        //Checking if user already exists!
        User.find({ email })
      .then((result) => {
        if (result.length) {
          // A user already exists
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          // Try to create new user
          // password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {                
              const newUser = new User({
                email: email,                               
                password: hashedPassword,            
                SoDt: phone, 
                accType: 1,
                isVerified: false
              });
              newUser
                .save()
                .then((result) => {
                  //handle account verification
                  sendVerificationEmail(result, res);    
                  res.redirect('/auth/Signin');
                })
                .catch((err) => {
                });
            })
            .catch((err) => {
                console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

// Verify a user
router.get("/:userId", async(req,res) => {
    try {        
        const user = await User.findOne({_id: req.params.userId});
        await User.updateOne({_id:user._id}, {isVerified:true}).then(res.redirect('/auth/Signin'));        
    }
    catch (err){
        res.redirect('/auth/Signup');
    }
});

module.exports = router;