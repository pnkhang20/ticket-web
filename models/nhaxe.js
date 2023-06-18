const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nhaXeSchema = new Schema({
  TenNhaXe: {
    type: String,
    required: true
  },
  DiaChiNhaXe: {
    type: String,
    required: true
  },
  SoDT:{
    type: String,
    required: true
  },
  Rating: {
    type: Number,
    min: 0,
    max: 5
  },
});

const NhaXe = mongoose.model('NhaXe', nhaXeSchema);
module.exports = NhaXe;

