'use strict';

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
const Token = require("../models").Token;

// load up the models
const User = require('../models').taiKhoan;
const taikhoanVerification = require('../models').taikhoanVerification;
const bcrypt = require('bcrypt');

const { default: _default } = require('@redis/search/dist/commands');
// load util password functions
const { isValidPassword, generateHash } = require('./password');

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(async function (id, done) {
        try {
            let user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);

        }
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }, (req, email, password, done) => {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        // asynchronous
        process.nextTick(() => localLoginAuthenticate(req, email, password, done));
    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }, (req, email, password, done) => {

        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        var phone = req.body.phone;

        // asynchronous
        process.nextTick(() => localSignUp(req, email, password, phone, done));

    }));

    async function localLoginAuthenticate(req, email, password, done) {
        try {  
            let user = await User.find({ email: email })
            const hashedpwd = user[0].password;
            const isVerified = user[0].isVerified;
            let ok = await bcrypt.compare(password, hashedpwd).then(result => {
                return result;
            })
            if (!isVerified){   // User is not verified                
                return done(null, false, req.flash('Login failed', 'User is not verified!'));
            }
            if (!ok) {
                return done(null, false, req.flash('Login failed', 'No user found.'));
            }
            // Return true if user credential is valid
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
}


