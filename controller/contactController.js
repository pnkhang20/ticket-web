const NhaXe = require("../models/nhaxe");

const controller = {};

controller.innitial = async (req, res) =>{
    const nhaXe = await NhaXe.find();
    res.render('Contact', {user: req.user, current: 2, nhaXe});
}

module.exports = controller