const db = require("../models");
const TaiKhoan = require("../models/taikhoan");
const taiKhoan = db.taiKhoan;
const VeXe = require("../models/vexe");
const XacNhanReset = require("../models/xacnhanreset")
const controller = {};
const nodemailer = require('nodemailer');
const { text } = require("body-parser");
const bcrypt = require('bcrypt');
controller.showLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('index', { current: 1, user: req.user });
    }
    res.render('Signin', { message: req.flash('loginMessage'), reqUrl: req.query.reqUrl, current: 4 });
}

controller.showRegister = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('Signup', { message: req.flash('signupMessage') });
}

controller.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

controller.showForgetPass = (req, res) => {
    res.render('ForgetPass')
}

controller.sendMail = async (req, res) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    let newPassword = makeid(10);
    var mainOptions = {
        from: 'Trip 4',
        to: req.body.email,
        subject: 'Reset',
        text: 'Chuỗi để reset của bạn là: ' + newPassword
    }
    let string = makeid(10)
    try {
        let taiKhoan = await TaiKhoan.find({ email: req.body.email })
        const saltRounds = 10;
        let ok = await bcrypt.hash(newPassword, saltRounds).then(result => {
            return result;
        })
        email_toFind = taiKhoan[0].email;
        if (email_toFind) {
            await TaiKhoan.updateOne({ email: email_toFind }, { password: ok });
        }
        (new XacNhanReset({
            content: string,
            ThuocTaiKhoan: taiKhoan._id
        })).save().then(transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                req.flash('message', 'Lỗi gửi mail: ' + err); //Gửi thông báo đến người dùng
                res.render('ForgetPass')
            } else {
                req.flash('message', 'Một email đã được gửi đến tài khoản của bạn'); //Gửi thông báo đến người dùng
                res.render('Signin')
            }
        }))
    }
    catch {
        res.redirect('/auth/ForgetPass')
    }
}

controller.resetPassword = async (req, res) => {
    console.log('')
    const taiKhoanId = await TaiKhoan.find({ email: req.body.email })._id
    const text = await XacNhanReset.findById(taiKhoanId)

    if (req.body.text === text) {
        res.render("ResetPass", { id: taiKhoanId })
    } else {
        res.render("ForgetPass", { text: "Chuỗi sai" });
    }
}

// route middleware to ensure user is logged in
controller.isLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect(`/auth/Signin?reqUrl=${req.originalUrl}`);
}

module.exports = controller;