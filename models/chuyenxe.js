const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chuyenXeSchema = new Schema({
  DiemBatDau:{
    type: String,
    required: true
  },
  DiemKetThuc: {
    type: String,
    required: true
  },
  TramDi: {
    type: String,
    required: true
  },
  TramDen: {
    type: String,
    required: true
  },
  ThoiGianKhoiHanh: {
    type: String,
    required: true
  },
  ThoiGianDenNoi: {
    type: String,
    required: true
  },
  HinhAnhXe: {
    type: [String]
  },
  ChinhSach: {
    type: Map,
    of: []
  },
  SoLuongGhe: {
    type: Number,
    required: true
  },
  LoaiXe: {
    type: String,
    required: true
  },
  DanhSachChoNgoi:{
    type: [Number],
    required: true,
  },
  GiaVe: {
    type: Number,
    required: true,
  },
  ThuocNhaXe:{
    type: Schema.Types.ObjectId, ref: 'NhaXe'
  }
}, {timestamps: true});

const ChuyenXe = mongoose.model('ChuyenXe', chuyenXeSchema);
module.exports = ChuyenXe;