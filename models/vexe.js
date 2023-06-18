const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const veXechema = new Schema({
  MaChuyenXe:{
    type: Schema.Types.ObjectId, ref: 'ChuyenXe', required: true
  },
  MaTaiKhoan: {
    type: Schema.Types.ObjectId, ref: 'TaiKhoan', required: true
  },
  SoLuongGheDat:{
    type: Number,
    required: true
  },
  TongTien:{
    type: mongoose.Types.Decimal128,
    required: true
  },
  TinhTrang: {
    type: Number,
    required: true
  },
  DanhSachGheNgoi:{
    type: [Number]
  },
  isCommented:{
    type: Boolean,
    default: false
  },
  DaThanhToan:{
    type: Boolean,
    default: false
  }
});

const VeXe = mongoose.model('VeXe', veXechema);
module.exports = VeXe;