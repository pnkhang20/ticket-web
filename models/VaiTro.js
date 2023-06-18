const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const VaiTro = mongoose.model(
  "Vaitro",
  new mongoose.Schema({
    name: String
  })
);

module.exports = VaiTro;