const { chuyenXe } = require('../models');
const db = require('../models');
const nhaXeController = require('../controller/nhaXeController')
const chuyenXeController = require('../controller/chuyenXeController');
const { body } = require('express-validator');
const DanhGia = require('../models/danhgia');
const { kgsearch_v1 } = require('googleapis');
const TaiKhoan = require('../models/taikhoan');

const ChuyenXe = db.chuyenXe;
const NhaXe = db.nhaXe;
const controller = {};

//Get all chuyen xe information
controller.nhaXe = async (req, res, next) => {
  try {
    var fromWhere = req.query.from;
    var toWhere = req.query.to;
    var whatDate = req.query.date;
    var nhaxe = req.query.nhaxe;
    var loaixe = req.query.loaixe;
    var giave = req.query.giave;
    let today = new Date(whatDate);
    let ngaymai = new Date(whatDate);
    ngaymai.setDate(ngaymai.getDate() + 1);

    let chuyenXes;

    if (loaixe == "" && giave == "" && nhaxe == "" && whatDate == "") {
      chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere });
    }
    if (whatDate != "") {
      chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }})
      if (nhaxe != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }})
      }
      if (giave != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }, GiaVe:giave })
      }
      if (loaixe != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }, LoaiXe: loaixe})
      }
      if (nhaxe != "" && giave != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }, GiaVe:giave});
      }
      if (nhaxe != "" && giave != "" && loaixe != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }, GiaVe:giave, LoaiXe:loaixe})
      }
    }

    if (nhaxe != ""){
      chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere});
      if (whatDate != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }})
      }
      if (giave != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, GiaVe:giave});
      }
      if (loaixe != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, LoaiXe:loaixe})
      }
      if (whatDate != "" && giave != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }, GiaVe:giave});
      }
      if (whatDate != "" && giave != "" && loaixe != ""){
        chuyenXes = await ChuyenXe.find({ DiemBatDau: fromWhere, DiemKetThuc: toWhere, ThoiGianKhoiHanh: { $gte: today, $lte: ngaymai }, GiaVe: giave, LoaiXe: loaixe});
      }
    }

  
    let thuocNhaXes = []
    for (const element of chuyenXes) {
      thuocNhaXes.push({ "ten": await getNhaXeName(element), "sodt": await getNhaXeSoDT(element), "rating": await getNhaXeRating(element) });
      let dpt = (await processDate(element.ThoiGianKhoiHanh)).toString()
      console.log(dpt)
      let arv = (await processDate(element.ThoiGianDenNoi)).toString()

      let ngayKhoiHanh = (await getDate(element.ThoiGianKhoiHanh)).toString()
      let ngayDen = (await getDate(element.ThoiGianDenNoi)).toString()
      element.ThoiGianKhoiHanh = dpt;
      element.ThoiGianDenNoi = arv;
      element.NgayKhoiHanh = ngayKhoiHanh;
      element.NgayDen = ngayDen;
    }

    let comments = []
    let index = 0
    for (const element of chuyenXes) {
      await DanhGia.find({ MaChuyenXe: element._id })
        .then((result) => {
          comments.push(result)})
    }

    let averageStar = []
    let totalComment = []
    for (const item of comments) {
      let total = 0
      let length = item.length
      let numComment = 0
      for (const comment of item) {
        numComment += 1
        total += comment['soSao']
      }
      totalComment.push(numComment)
      averageStar.push(total / length)
    }


    let modifiedChuyenXe = chuyenXes.map(function (item, i) {
      return {
        chuyenInfo: chuyenXes[i],
        nhaXeInfo: thuocNhaXes[i],
        commentData: JSON.stringify(comments[i]),
        average: averageStar[i],
        total: totalComment[i],
        t: (new Date("1970-01-01T" + chuyenXes[i].ThoiGianDenNoi.toString() + ":00").getHours() - 12) - (new Date("1970-01-01T" + chuyenXes[i].ThoiGianKhoiHanh.toString()+ ":00").getHours() - 12)
      };
    });

    res.render('BookTickets', {
      chuyenXe: modifiedChuyenXe,
      user: req.user,
      layout: 'layout',
      comments
    })
    //console.log(modifiedChuyenXe)
  } catch (err) {
    next(err);
  }
}

async function getNhaXeName(chuyenXe) {
  let danhSachTen = []
  await NhaXe.findById(chuyenXe.ThuocNhaXe)
    .then((result) => danhSachTen.push(result.TenNhaXe))
    .catch((err) => console.log(err));
  return danhSachTen[0];
}

async function getNhaXeSoDT(chuyenXe) {
  let danhSachSoDT = []
  await NhaXe.findById(chuyenXe.ThuocNhaXe)
    .then((result) => danhSachSoDT.push(result.SoDT))
    .catch((err) => console.log(err));
  return danhSachSoDT[0];
}

async function getNhaXeRating(chuyenXe) {
  let danhSachRating = []
  await NhaXe.findById(chuyenXe.ThuocNhaXe)
    .then((result) => danhSachRating.push(result.Rating))
    .catch((err) => console.log(err));
  return danhSachRating[0];
}

async function processDate(dpTime) {
  let timestampStart = new Date(dpTime.toString());
  let fullDateStart = (timestampStart.getFullYear().toString() +
    "-" + (timestampStart.getMonth() + 1).toString() + "-" + timestampStart.getDate().toString()).toString()
  let timeStart = (timestampStart.getHours() < 10 ? "0" + timestampStart.getHours() : timestampStart.getHours()) + ":"
    + (timestampStart.getMinutes() < 10 ? "0" + timestampStart.getMinutes() : timestampStart.getMinutes());
  let result = timeStart
  return result
}

async function getDate(dpTime){
  let timestampStart = new Date(dpTime.toString());
  let fullDateStart = (timestampStart.getFullYear().toString() +
  "/" + (timestampStart.getMonth() + 1).toString() + "/" + timestampStart.getDate().toString()).toString()
  return fullDateStart
}




module.exports = controller