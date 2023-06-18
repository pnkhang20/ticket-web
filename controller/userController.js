const ChuyenXe = require("../models/chuyenxe");
const VeXe = require("../models/vexe")
const NhaXe = require("../models/nhaxe");
const { ve } = require("../models");
const DanhGia = require("../models/danhgia");
const controller = {};
const nodemailer = require('nodemailer');
const TaiKhoan = require("../models/taikhoan");
const {generateHash, isValidPassword} = require('./password');

controller.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

controller.changeInfo = async (req, res, next) => {
    const username = req.body.name
    const dob = req.body.date
    const gender = req.body.gender
    const update = {
        'GioiTinh': gender,
        'HoTen': username,
        'NgaySinh': dob
    }
    await TaiKhoan.findByIdAndUpdate(req.user._id, update)
        .then(res.redirect('/user'))
        .catch((err) => console.log(err));
}

controller.changePassword = async (req, res, next) => {
    const oldPassOfUsername = req.user.password
    console.log("oldPass" + oldPassOfUsername)
    if (req.body.newPass !== req.body.confirmNewPass) {
        req.flash('message', 'The new pass not matched')
        res.redirect('/user')
    }
    console.log("password from client" + req.body.oldpass)
    if (isValidPassword(req.body.oldpass, oldPassOfUsername)) {

        const update = {
            'password': generateHash(req.body.oldpass)
        }
        await TaiKhoan.findByIdAndUpdate(req.user._id, update)
            .then(() => {
                req.flash('message', 'Change successfully');
                res.redirect('/user')
            })
            .catch((err) => console.log(err))
    } else {
        res.redirect('/user'), req.flash('message', 'the password is incorrect')
    }

}

controller.showProfile = (req, res) => {
    const dob = getDate(req.user.NgaySinh)
    res.render('personal_page/personal-page-userinfo', {
        user: req.user, currentTab: 1, dob
    });

}

controller.showTicket = async (req, res) => {
    const veHuy = await VeXe.find({ MaTaiKhoan: req.user._id, TinhTrang: -1 })
    const veDaDi = await VeXe.find({ MaTaiKhoan: req.user._id, TinhTrang: 1 })
    const veChuaDi = await VeXe.find({ MaTaiKhoan: req.user._id, TinhTrang: 0 })

    // console.log("Da di " + veDaDi)
    // console.log("Chua di " + veChuaDi)
    // console.log("Huy " + veHuy)

    const chiTietVeHuy = []
    const ThoiGianDiCuaVeHuy = []
    const ThoiGianDenCuaVeHuy = []
    for (const element of veHuy) {
        await ChuyenXe.findById(element.MaChuyenXe).then((result) => {
            if (result !== null) {
                chiTietVeHuy.push(result)
                ThoiGianDiCuaVeHuy.push(modifiedDate(result.ThoiGianKhoiHanh))
                ThoiGianDenCuaVeHuy.push(modifiedDate(result.ThoiGianDenNoi))
            }
        })
    }

    const chiTietVeDaDi = []
    const ThoiGianDiCuaVeDaDi = []
    const ThoiGianDenCuaVeDaDi = []
    for (const element of veDaDi) {
        await ChuyenXe.findById(element.MaChuyenXe).then((result) => {
            if (result !== null) {
                chiTietVeDaDi.push(result)
                ThoiGianDiCuaVeDaDi.push(modifiedDate(result.ThoiGianKhoiHanh))
                ThoiGianDenCuaVeDaDi.push(modifiedDate(result.ThoiGianDenNoi))
            }
        })
    }

    const chiTietVeChuaDi = []
    const ThoiGianDiCuaVeChuaDi = []
    const ThoiGianDenCuaVeChuaDi = []
    for (const element of veChuaDi) {
        await ChuyenXe.findById(element.MaChuyenXe).then((result) => {
            if (result !== null) {
                chiTietVeChuaDi.push(result)
                ThoiGianDiCuaVeChuaDi.push(modifiedDate(result.ThoiGianKhoiHanh))
                ThoiGianDenCuaVeChuaDi.push(modifiedDate(result.ThoiGianDenNoi))
            }
        })
    }

    const modifiedVeDaDi = veDaDi.map(function (item, i) {
        return {
            chiTietVe: chiTietVeDaDi[i],
            soBoVe: veDaDi[i],
            ThoiGianDi: ThoiGianDiCuaVeDaDi[i],
            ThoiGianDen: ThoiGianDenCuaVeDaDi[i]
        };
    });

    const modifiedVeChuaDi = veChuaDi.map(function (item, i) {
        return {
            chiTietVe: chiTietVeChuaDi[i],
            soBoVe: veChuaDi[i],
            ThoiGianDi: ThoiGianDiCuaVeChuaDi[i],
            ThoiGianDen: ThoiGianDenCuaVeChuaDi[i]
        };
    });

    const modifiedVehuy = veHuy.map(function (item, i) {
        return {
            chiTietVe: chiTietVeHuy[i],
            soBoVe: veHuy[i],
            ThoiGianDi: ThoiGianDiCuaVeHuy[i],
            ThoiGianDen: ThoiGianDenCuaVeHuy[i]
        };
    });
    // console.log(modifiedVehuy)
    // console.log(modifiedVeDaDi)
    // console.log(modifiedVeChuaDi);
    res.render('personal_page/personal-page-userticket', {
        user: req.user,
        veHuy: modifiedVehuy,
        veDaDi: modifiedVeDaDi,
        veChuaDi: modifiedVeChuaDi,
        currentTab: 2
    });
}

controller.showChangePass = (req, res) => {
    res.render('personal_page/personal-page-changepass', {
        user: req.user, currentTab: 3
    });
}

controller.showCommentPage = async (req, res) => {
    let id = req.params.id
    // console.log(id)
    const vexe = await VeXe.findById(id);
    const isCommented = vexe.isCommented
    const chuyenXe = await ChuyenXe.findById(vexe.MaChuyenXe)
    if (!isCommented) {
        res.render('Comment', { id, chuyenXe, vexe, user: req.user });
    } else {
        res.render('personal_page/personal-page-userticket', { text: "Bạn đã comment rồi" });
    }
}

controller.submitComment = async (req, res) => {
    let id = req.params.id
    let star = req.body.rating;
    let content = req.body.content;

    const comment = new DanhGia({
        NoiDung: content,
        ThuocNguoiDung: req.user.id,
        MaChuyenXe: id,
        soSao: star
    })

    await comment.save().then(res.redirect('/user'));
}

controller.showPayment = async (req, res) => {
    let id = req.params.id
    let pay = req.params.pay;
    let seats = decodeURIComponent(req.params.seats)
    seats = seats.substring(0, seats.length - 1)
    seats = seats.slice(1)
    seats = JSON.parse("[" + seats + "]")
    // console.log("Danh sach cho ngoi payment" + (seats))
    // console.log("Cho ngoi ben payment" + seats.length)
    const chuyenXe = await ChuyenXe.findById(id)
    const tgDi = getTime(chuyenXe.ThoiGianKhoiHanh)
    const tgDen = getTime(chuyenXe.ThoiGianDenNoi)
    const ngayDi = getDate(chuyenXe.ThoiGianDenNoi)
    const ngayDen = getDate(chuyenXe.ThoiGianDenNoi)
    const nhaXe = await NhaXe.findById(chuyenXe.ThuocNhaXe)

    // console.log(req.user)
    res.render('Payment', {
        tongTien: pay,
        choNgoi: seats,
        chuyenXe,
        user: req.user,
        nhaXe,
        tgDi,
        tgDen,
        ngayDi,
        ngayDen,
        seats,
        soVe: seats.length
    });
}

controller.proceedBooking = async (req, res) => {
    const idCX = req.params.idCX;
    const idUser = req.params.idUser;
    let seats = decodeURIComponent(req.params.seats);
    seats = JSON.parse("[" + seats + "]")
    // console.log("Ghe" + seats)
    const tien = parseInt(decodeURIComponent(req.params.tongTien));
    const soVe = parseInt(decodeURIComponent(req.params.soVe));

    const chuyenXe = await ChuyenXe.findById(idCX);
    // console.log(chuyenXe)
    for (let i = 0; i < chuyenXe.DanhSachChoNgoi.length; i++) {
        for (const element of seats) {
            console.log("ghe trong loop" + element)
            if (parseInt(element) === i + 1) {
                console.log("Vi Tri ben user controller" + (i + 1))
                chuyenXe.DanhSachChoNgoi[i] = 1
                break
            }
        }
    }

    const nhaXe = await NhaXe.findById(chuyenXe.ThuocNhaXe)
    console.log(nhaXe)

    await ChuyenXe.findByIdAndUpdate(chuyenXe._id, { DanhSachChoNgoi: chuyenXe.DanhSachChoNgoi })
        .catch((err) => console.log(err))

    const date = new Date(chuyenXe.ThoiGianKhoiHanh)
    const day = date.getDate().toString()
    const mon = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    const hour = date.getHours().toString();
    const min = date.getMinutes().toString();

    let ticket_detail = ''

    ticket_detail += `
    <div style="padding: 10px;">
        <p><b>Nhà xe</b> ${nhaXe.TenNhaXe} </p>
        <p><b>Địa chỉ:</b> ${nhaXe.DiaChi}</p>
        <p><b>Số điện thoại: </b> ${nhaXe.SoDT}</p>
        <div style="padding: 10px; background-color: white;">
            <p style="color: black; text-align: center;"><b>VÉ XE KHÁCH</b></p>
            <p style="color: black; text-align: center;"><b>TUYẾN ĐƯỜNG: ${chuyenXe.DiemBatDau} - ${chuyenXe.DiemKetThuc}</b></p>
            <p><span><b>Loại xe:</b> ${chuyenXe.LoaiXe}</span></p>
            <p>
                <span><b>Trạm đón:</b> ${chuyenXe.TramDi}</span>
                <span><b>Trạm đến:</b> ${chuyenXe.TramDen}</span>
            </p>
            <p><b>Thời gian khời hành:</b> ${hour} Giờ ${min} Phút Ngày ${day} Tháng ${mon} Năm ${year}</p>
            <hr>
            <h3>Thông tin khách hàng</h3>
            <p>
                <p><b>Họ tên:</b> ${req.user.HoTen}</p>
                <p><b>Số điện thoại:</b> ${req.user.SoDt}</p>
                <p><b>Email:</b> ${req.user.email}</p>
                <p><b>Vị trí ghế ngồi:</b> ${seats}</p>
                <p>
                    <span><b>Tổng tiền: </b>${tien}</span>
                    <span><b>Tình trạng: </b>Chưa thanh toán</span>
                </p>
            </p>
        </div>
    </div>
    `;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    var mainOptions = {
        from: 'Trip 4',
        to: req.user.email,
        subject: 'Trip4-Ticket info',
        text: 'Cảm ơn bạn đã đặt vé',
        html: ticket_detail
    }
    await new VeXe({
        MaChuyenXe: idCX,
        MaTaiKhoan: idUser,
        SoLuongGheDat: soVe,
        TongTien: tien,
        DanhSachGheNgoi: seats,
        TinhTrang: 0,
        DaThanhToan: false
    }).save()
        .then((result) => {
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                    req.flash('message', 'Lỗi gửi mail: ' + err); //Gửi thông báo đến người dùng
                    res.redirect(req.originalUrl);
                } else {
                    console.log('Message sent: ' + info.response);
                    req.flash('message', 'Một email đã được gửi đến tài khoản của bạn'); //Gửi thông báo đến người dùng
                    res.redirect('/user/tickets');
                }
            });
        })
        .catch((err) => console.log(err))
}

controller.cancelTicket = async (req, res) => {
    const id = req.params.id;
    let veXe = await VeXe.findById(id)
    await VeXe.findByIdAndUpdate(veXe._id, { TinhTrang: -1 }).then(res.redirect('/user/tickets'))
}

controller.isLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect(`/auth/Signin?reqUrl=${req.originalUrl}`);
}

function modifiedDate(date) {
    let timestampStart = new Date(date.toString());
    let fullDateStart = (timestampStart.getDate().toString() + "/" + (timestampStart.getMonth() + 1).toString()
        + "/" + timestampStart.getFullYear().toString()).toString()
    let timeStart = (timestampStart.getHours() < 10 ? "0" + timestampStart.getHours() : timestampStart.getHours()) + ":"
        + (timestampStart.getMinutes() < 10 ? "0" + timestampStart.getMinutes() : timestampStart.getMinutes());

    return timeStart + "-" + fullDateStart
}

function getTime(date) {
    let timestampStart = new Date(date);
    let timeStart = (timestampStart.getHours() < 10 ? "0" + timestampStart.getHours() : timestampStart.getHours()) + ":"
        + (timestampStart.getMinutes() < 10 ? "0" + timestampStart.getMinutes() : timestampStart.getMinutes());
    return timeStart
}

function getDate(date) {
    let timestampStart = new Date(date);
    let fullDateStart = (timestampStart.getDate().toString() + "/" + (timestampStart.getMonth() + 1).toString()
        + "/" + timestampStart.getFullYear().toString()).toString()
    return fullDateStart
}


module.exports = controller