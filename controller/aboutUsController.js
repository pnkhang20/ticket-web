const controller = {};

controller.innitial = (req, res) =>{
    res.render('AboutUs', {user: req.user, current: 3});
}

module.exports = controller