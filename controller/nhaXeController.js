
const db = require('../models')
const NhaXe = db.nhaXe;
const controller = {};

//CREATE
controller.createNhaXe = async (req, res, next) => {
  const newNhaXe = new NhaXe(req.body);
  try {
    const savedNhaXe = await newNhaXe.save()
    res.status(200).json(savedNhaXe)
  } catch (err) {
    next(err);
  }
}

//UPDATE
controller.updateNhaXe = async (req, res, next) => {
  try {
    const updatedNhaXe = await NhaXe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true });
    res.status(200).json(updatedNhaXe)
  } catch (err) {
    next(err);
  }
}
//DELETE
controller.deleteNhaXe = async (req, res, next) => {
  try {
    await NhaXe.findByIdAndDelete(
      req.params.id
    );
    res.status(200).json("Nha xe deleted!");
  } catch (err) {
    next(err);
  }
}
//GET
controller.getNhaXe = async (req, res, next) => {
  try {
    const getNhaXe = await NhaXe.findById(
      req.params.id
    ).populate('ChuyenXes');
    res.status(200).json(getNhaXe);
  } catch (err) {
    next(err);
  }
}
//GET ALL
controller.getAllNhaXe = async (req, res, next) => {
  try {
    const getAllNhaXe = await NhaXe.find().then(order => {
      res.status(200).json({order: order});
    });
    
  } catch (err) {
    next(err);
  }
}

module.exports = controller