const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const danhGiaSchema = new Schema({
    NoiDung:{
        type: String,
        required: true
    },ThuocNguoiDung:{
        type: Schema.Types.ObjectId, ref: 'TaiKhoan'
    },MaChuyenXe:{
        type: Schema.Types.ObjectId, ref: 'ChuyenXe'
    },
    soSao:{
        type: Number,
        required: true
    }
}, {timestamps: true});

const DanhGia = mongoose.model('DanhGia', danhGiaSchema);
module.exports = DanhGia;