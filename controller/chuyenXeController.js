const db = require('../models');
const ChuyenXe = db.chuyenXe;
const NhaXe = db.nhaXe;
const controller = {};


//CREATE
controller.createChuyenXe = async(req,res,next)=>{
    const idnhaxe = req.params.nhaXeId;
    const newChuyenXe = new ChuyenXe(req.body);
    try {
        const savedChuyenXe = await newChuyenXe.save()
        try {
            await NhaXe.findByIdAndUpdate(
                idnhaxe, 
                {$push: {ChuyenXes: savedChuyenXe._id }
            });
        } catch (err) {
            next(err);
        }
        res.status(200).json(savedChuyenXe);
    } catch (err) {
        next(err);
    }
}

//UPDATE
controller.updateChuyenXe = async (req, res, next) => {
    try {
      const updatedChuyenXe = await ChuyenXe.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true });
      res.status(200).json(updatedChuyenXe)
    } catch (err) {
      next(err);
    }
  }
  //DELETE
  controller.deleteChuyenXe = async (req, res, next) => {
    const nhaXeId = req.params.nhaXeId;
    try {
      await ChuyenXe.findByIdAndDelete(
        req.params.id
      );
      try {
        await NhaXe.findByIdAndUpdate(nhaXeId, { $pull: {ChuyenXes: req.params._id}})
      } catch (err) {
        next(err);
      }
      res.status(200).json("Chuyen Xe Deleted!");
    } catch (err) {
      next(err);
    }
  }
  //GET
  controller.getChuyenXe = async (req, res, next) => {
    try {
      const getChuyenXe = await ChuyenXe.findById(
        req.params.id
      );
      res.status(200).json(getChuyenXe);
    } catch (err) {
      next(err);
    }
  }
  //GET ALL
  controller.getAllChuyenXe = async (req, res, next) => {
    try {
      const getAllChuyenXe = await ChuyenXe.find(
        req.params.id
      ).populate('ThuocNhaXe');
      res.status(200).json(getAllChuyenXe);
    } catch (err) {
      next(err);
    }
  }

  
  module.exports = controller