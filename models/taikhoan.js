const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const taiKhoanSchema = new Schema({
    email: {
      type: String,
      required: true, index: { unique: true }
    },
    password: {
      type: String,
      required: true
    },
    HoTen: String,
    SoDt: {
      type: String,
      required: true, index: { unique: true }
    },
    GioiTinh: Boolean,
    NgaySinh: Date,
    accType: {
      type: Number,
      required: true
    },
    isVerified: {type: Boolean, default: false},
}, {timestamps: true});


taiKhoanSchema.pre("save", function (next) {
  const user = this

  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(8, function (saltError, salt) {
      if (saltError) {
        return next(saltError)
      } else {
        bcrypt.hash(user.password, salt, function(hashError, hash) {
          if (hashError) {
            return next(hashError)
          }

          user.password = hash
          next()
        })
      }
    })
  } else {
    return next()
  }
});

taiKhoanSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

const TaiKhoan = mongoose.model('TaiKhoan', taiKhoanSchema);
module.exports = TaiKhoan;