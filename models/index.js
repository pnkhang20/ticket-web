const { request } = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const db = {};

db.mongoose = mongoose;

db.taiKhoan = require("./taikhoan");
db.vaiTro = require("./VaiTro");
db.danhGia = require("./danhgia");
db.ve = require('./vexe');
db.chuyenXe = require("./chuyenxe");
db.nhaXe = require("./nhaxe");
db.ROLES = ["user", "admin", "nhaXe"];

module.exports = db;