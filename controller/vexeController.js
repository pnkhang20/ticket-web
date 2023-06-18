const db = require('../models');
const VeXe = db.vexe;
const controller = {};

controller.createVeXe = async (req, res, next) => {
  const newVeXe = new VeXe(req.body);
  try {
    const savedVeXe = await newVeXe.save()
    res.status(200).json(savedVeXe);
  } catch (err) {
    next(err);
  }
}

//UPDATE
controller.updateVeXe = async (req, res, next) => {
  try {
    const updatedVeXe = await VeXe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true });
    res.status(200).json(updatedVeXe)
  } catch (err) {
    next(err);
  }
}
//DELETE
controller.deleteVeXe = async (req, res, next) => {
  try {
    await VeXe.findByIdAndDelete(
      req.params.id
    );
    res.status(200).json("Ve Xe Deleted!");
  } catch (err) {
    next(err);
  }
}
//GET
controller.getVeXe = async (req, res, next) => {
  try {
    const getVeXe = await VeXe.findById(
      req.params.id
    );
    res.status(200).json(getVeXe);
  } catch (err) {
    next(err);
  }
}
//GET ALL
controller.getAllVeXe = async (req, res, next) => {
  try {
    const getAllVeXe = await VeXe.find(
      req.params.id
    );
    res.status(200).json(getAllVeXe);
  } catch (err) {
    next(err);
  }
}

module.exports = controller