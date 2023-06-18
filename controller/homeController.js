const controller = {};

controller.innitial = (req, res) =>{
    console.log(req.user);
    res.render('index', {user: req.user, current: 1});
}

module.exports = controller