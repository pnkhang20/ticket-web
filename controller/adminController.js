const controller = {}
const db = require('../models');
const TaiKhoan = require('../models/taikhoan');
const VeXe = require('../models/vexe');

const { uploadFile } = require('../upload/uploadModel');
const NhaXe = db.nhaXe;
const ChuyenXe = db.chuyenXe;
const Ve = db.ve;

//log out
controller.logout = async (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
}

// Nha Xe
controller.showCreateNX = async (req, res, next) => {
  res.render('admin/CreateNhaXe', {
    title: "web04-group6",
    layout: "adminLayout"
  });
}

controller.showEditNhaXe = async (req, res, next) => {

  await NhaXe.findById(req.params.id)
    .then((result) => {
      // console.log(typeof result.DiaChiNhaXe)
      res.render('admin/EditNhaXe', {
        title: "web04-group6",
        layout: "adminLayout",
        nhaXe: result,
      })
    })
    .catch((err) => console.log(err));
}

controller.createNX = async (req, res, next) => {
  await NhaXe.find({ "TenNhaXe": req.body.tenNx })
    .then((result) => {
      // console.log(result)
      if (result[0] !== undefined) {
        let errorString = "Nhà xe đã tồn tại";
        res.render("Error", { error: errorString, layout: "layout", title: "Error" });
      } else {
        let addr = req.body.addr;
        let phone = req.body.phone;
        let nhaXe = new NhaXe({
          DiaChiNhaXe: addr,
          TenNhaXe: req.body.tenNx,
          SoDT: phone
        });

        nhaXe.save().then((result) => {
          res.redirect('/admin/NhaXe')
        }).catch((err) => {
          console.log(err)
        })
      }
    }).catch((err) => console.log(err));
}

controller.editNX = async (req, res, next) => {
  let addr = req.body.addr;
  let phone = req.body.phone;
  let nhaXe = {
    DiaChiNhaXe: addr,
    TenNhaXe: req.body.tenNx,
    SoDT: phone
  };

  await NhaXe.findByIdAndUpdate(
    req.params.id, nhaXe).then((result) => {
      // console.log("after update " + result);
      res.redirect('/admin/NhaXe')
    }).catch((err) => console.log(err));
}

controller.deleteNX = async (req, res, next) => {
  try {
    await NhaXe.findByIdAndDelete(req.params.id)
      .then((result) => {
        // console.log(result);
        res.redirect('/admin/NhaXe')
      }).catch((err) => console.log(err));
  } catch (err) {
    next(err);
  }
}

controller.getNhaXes = async (req, res, next) => {
  try {
    const NhaXes = await NhaXe.find();
    res.render('admin/NhaXe', {
      nhaXe: NhaXes,
      title: "web04-group6",
      layout: "adminLayout"
    })
  } catch (err) {
    next(err);
  }
}

//Nha Xe


// Chuyen Xe
controller.getChuyenXes = async (req, res, next) => {
  try {
    const chuyenXes = await ChuyenXe.find();
    let thuocNhaXes = []
    for (let i = 0; i < chuyenXes.length; i++) {
      thuocNhaXes.push({ "ten": await getNhaXeName(chuyenXes[i]) });
    }
    const ghe = getOccupiedSeat(chuyenXes);
    let modifiedChuyenXe = chuyenXes.map(function (item, i) {
      return {
        thongTinChuyenXe: chuyenXes[i],
        tenNhaXe: thuocNhaXes[i],
        SoLuongGhe: ghe[i]
      };
    });
    res.render('admin/ChuyenXe', {
      chuyenXe: modifiedChuyenXe,
      title: "web04-group6",
      layout: "adminLayout"
    })
  } catch (err) {
    next(err);
  }
}

controller.showCreateCX = async (req, res) => {
  res.render('admin/CreateChuyenXe', {
    title: "web04-group6",
    layout: "adminLayout"
  });
}

controller.showEditChuyenXe = async (req, res) => {

  await ChuyenXe.findById(req.params.id)
    .then((result) => {
      let timestampStart = new Date(result.ThoiGianKhoiHanh.toString());
      let fullDateStart = (timestampStart.getFullYear().toString() +
        "-" + ((timestampStart.getMonth() + 1 )<10?"0" + (timestampStart.getMonth() + 1 ): (timestampStart.getMonth() + 1 )).toString() + "-" 
        + (timestampStart.getDate()<10?"0"+timestampStart.getDate():timestampStart.getDate()).toString()).toString()
      let timeStart = (timestampStart.getHours() < 10 ? "0" + timestampStart.getHours() : timestampStart.getHours()) + ":"
        + (timestampStart.getMinutes() < 10 ? "0" + timestampStart.getMinutes() : timestampStart.getMinutes());

      let timestampEnd = new Date(result.ThoiGianDenNoi.toString());
      let fullDateEnd = (timestampEnd.getFullYear().toString() +
      "-" + ((timestampEnd.getMonth() + 1 )<10?"0" + (timestampEnd.getMonth() + 1 ): (timestampEnd.getMonth() + 1 )).toString() + "-" 
      + (timestampEnd.getDate()<10?"0"+timestampEnd.getDate():timestampEnd.getDate()).toString()).toString()
      let timeEnd = (timestampEnd.getHours() < 10 ? "0" + timestampEnd.getHours() : timestampEnd.getHours()) + ":"
        + (timestampEnd.getMinutes() < 10 ? "0" + timestampEnd.getMinutes() : timestampEnd.getMinutes());


      // console.log(fullDateStart)
      // console.log(fullDateEnd)
      // console.log(timeEnd)
      // console.log(timeStart)

      // console.log(result)
      // console.log(result.HinhAnhXe[0]);
      res.render('admin/EditChuyenXe', {
        title: "web04-group6",
        layout: "adminLayout",
        chuyenXe: result,
        fullDateStart,
        fullDateEnd,
        timeStart,
        timeEnd,
      })
    })
    .catch((err) => console.log(err));
}

controller.createCX = async (req, res) => {
  let nhaXe = ""
  await NhaXe.find({ "TenNhaXe": req.body.nhaXe })
    .then((result) => {
      // console.log(result)
      nhaXe = result[0]._id
    })
    .catch((err) => console.log(err));

  let images = req.body.images.split("\n");

  let newImages = []

  for (let i = 0; i < images.length; i++) {

    let linkImage = images[i];
    let id = linkImage.split("/")[5];

    let urlImage = 'https://drive.google.com/uc?export=view&id=' + id;
    newImages.push(urlImage);
  }

  let numSeat = 16;
  let start = req.body.start;
  let end = req.body.end;

  let startDate = new Date(req.body.departureDate + " " + req.body.departureTime);
  let endDate = new Date(req.body.arrivalDate + " " + req.body.arrivalTime);
  let carType = req.body.type;
  let ticketPrice = req.body.ticketPrice;

  var DanhSachChoNgoi = []
  for (let i = 0; i < numSeat; i++) {
    DanhSachChoNgoi.push(0);
  }

  let ChinhSach = {
    "ghiChu": ["Phí huỷ sẽ được tính trên giá gốc, không giảm trừ khuyến mãi hoặc giảm giá; đồng thời không vượt quá số tiền quý khách đã thanh toán."],
    "yeucau":
      ["Có mặt tại văn phòng/quầy vé/bến xe trước 30 phút để làm thủ tục lên xe",
        "Đổi vé giấy trước khi lên xe",
        "Xuất trình SMS/Email đặt vé trước khi lên xe",
        "Không mang đồ ăn, thức ăn có mùi lên xe",
        "Không hút thuốc, uống rượu, sử dụng chất kích thích trên xe",
        "Không mang các vật dễ cháy nổ lên xe",
        "Không vứt rác trên xe",
        "Không làm ồn, gây mất trật tự trên xe",
        "Không mang giày, dép trên xe"
      ],
    "hanhly": [
      "Tổng trọn lượng hành lý không vượt quá 20 Kg",
      "Không vận chuyển hành hóa cồng kềnh"
    ],
    "khac": [
      "Trẻ em dưới 7 tuổi hoặc dưới 130 cm được miễn phí vé nếu ngồi cùng ghế/giường với bố mẹ",
      "Phụ nữ mang thai cần đảm bảo sức khỏe trong suốt quá trình di chuyển",
      "Nhà xe có quyền từ chối phục vụ nếu hành khách không tuân thủ quy định về trẻ em và phụ nữ có thai"
    ]
  }

  let chuyenXe = new ChuyenXe({
    HinhAnhXe: newImages,
    DiemBatDau: start,
    DiemKetThuc: end,
    ThoiGianDenNoi: endDate,
    ThoiGianKhoiHanh: startDate,
    SoLuongGhe: numSeat,
    ChinhSach: ChinhSach,
    GiaVe: ticketPrice,
    LoaiXe: carType,
    DanhSachChoNgoi: DanhSachChoNgoi,
    ThuocNhaXe: nhaXe,
    TramDi: "Trạm " + start,
    TramDen: "Trạm " + end
  });

  chuyenXe.save()
    .then(() => res.redirect('/admin/ChuyenXe'))
    .catch((err) => res.send(err));
}

controller.editCX = async (req, res) => {

  let images = req.body.images.split("\n");
  let newImages = []

  for (const element of images) {

    let linkImage = element;
    if (linkImage.split("/").length < 5) {
      newImages.push(element)
    } else {
      let id = linkImage.split("/")[5];
      if (id === " ") continue
      let urlImage = 'https://drive.google.com/uc?export=view&id=' + id;
      newImages.push(urlImage);
    }
  }
  let numSeat = 16;
  let start = req.body.start;
  let end = req.body.end;

  let startDate = new Date(req.body.departureDate + " " + req.body.departureTime);
  let endDate = new Date(req.body.arrivalDate + " " + req.body.arrivalTime);
  let carType = req.body.type;
  let ticketPrice = req.body.ticketPrice;
  const update = {
    HinhAnhXe: newImages,
    DiemBatDau: start,
    DiemKetThuc: end,
    ThoiGianDenNoi: endDate,
    ThoiGianKhoiHanh: startDate,
    SoLuongGhe: numSeat,
    GiaVe: ticketPrice,
    LoaiXe: carType
  }

  await ChuyenXe.findByIdAndUpdate(req.params.id, update, {
    new: true
  }).then((result) => {
    // console.log("after update " + result);
    res.redirect('/admin/ChuyenXe')
  }).catch((err) => console.log(err));
}

controller.deleteCX = async (req, res) => {
  await ChuyenXe.findByIdAndDelete(req.params.id)
    .then((result) => {
      // console.log(result)
      res.redirect('/admin/ChuyenXe')
    }).catch((err) => console.log(err))
}

//Chuyen xe

// Dat Ve
controller.getVes = async (req, res, next) => {
  try {
    const ves = await Ve.find();
    const users = []

    for (let i = 0; i < ves.length; i++) {
      users.push({ "ten": await getUserName(ves[i]) });
    }

    let modifiedVeXe = ves.map(function (item, i) {
      return {
        thongTinVeXe: ves[i],
        tenUser: users[i]
      };
    });

    res.render('admin/DatVe', {
      ve: modifiedVeXe,
      title: "web04-group6",
      layout: "adminLayout"
    })
  } catch (err) {
    next(err);
  }
}

controller.showDetailVeXe = async (req, res, next) => {
  let chuyenXe = await ChuyenXe.findById(req.params.idChuyenXe);
  let user = await TaiKhoan.findById(req.params.idUser);
  let veXe = await VeXe.findById(req.params.id);

  // console.log(veXe)

  res.render('admin/DatVeChiTiet', {
    veXe,
    chuyenXe,
    user,
    title: "web04-group6",
    layout: "adminLayout"
  })

}

async function getUserName(veXe) {
  let danhSachTen = []

  await TaiKhoan.findById(veXe.MaTaiKhoan)
    .then((result) => danhSachTen.push(result.HoTen))
    .catch((err) => console.log(err));
  return danhSachTen[0];
}

async function getNhaXeName(chuyenXe) {
  let danhSachTen = []

  await NhaXe.findById(chuyenXe.ThuocNhaXe)
    .then((result) => danhSachTen.push(result.TenNhaXe))
    .catch((err) => console.log(err));
  return danhSachTen[0];
}

function getOccupiedSeat(chuyenXe) {
  let soluong = []
  for (const element of chuyenXe) {
    let count = 0;
    for (let j = 0; j < element.DanhSachChoNgoi.length; j++) {
      if (element.DanhSachChoNgoi[j] === 1) {
        count = count + 1;
      }
    }
    soluong.push({ "soluong": count });
  }
  return soluong
}

controller.isAdminLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated() && req.user.accType === 0) {
    return next();
  }

  res.redirect(`/auth/Signin?reqUrl=${req.originalUrl}`);
}

module.exports = controller