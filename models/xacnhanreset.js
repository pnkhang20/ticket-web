const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const xacNhanResetSchema = new Schema({
  content:{
    type: String,
    required: true
  },
  ThuocNguoiDung:{
    type: Schema.Types.ObjectId, ref: 'taikhoan'
  }
}, {timestamps: true});

const XacNhanReset = mongoose.model('XacNhanReset', xacNhanResetSchema);
module.exports = XacNhanReset;