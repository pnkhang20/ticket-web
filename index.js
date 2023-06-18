const express = require('express')
const app = express();
const expressHbs = require('express-handlebars');

const { SESSION_SECRET, REDIS } = require('./config/authConfig.json');

const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const redisStore = require('connect-redis')(session);

const fileUpload = require('express-fileupload');

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const { createClient } = require("redis")
let redisClient = createClient({
    host: redisHost,
    port: redisPort,
    legacyMode: true
});
redisClient.connect().catch(console.error)


const morgan = require('morgan');
const db = require("./models/index");
const VeXe = require('./models/vexe');
const dbURI = 'mongodb+srv://tuanquan:tuanquan@cluster-webdev.rnlm5st.mongodb.net/Web04-Group6?retryWrites=true&w=majority';

app.engine('hbs', expressHbs.engine({
    layoutDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    defaultLayout: 'layout',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
}));

var hbs = expressHbs.create({});

// register new function
hbs.handlebars.registerHelper('isNull', function(value) {
//   console.log(value);
  return value === undefined;
})

hbs.handlebars.registerHelper('eq', function (value1,value2) {
    if(value1 === undefined) return false
    if(value2=== undefined) return false
    if( value1 === "" && value2 === "") return true
    return value1.toString().trim().toLowerCase() === value2.toString().trim().toLowerCase()
})

hbs.handlebars.registerHelper('getDateMongoose', function(value){
    // console.log(typeof value);
    // console.log(value);
    let timestamp = new Date(value);
    let fulltime = (timestamp.getFullYear.toString()+ "-" +timestamp.getMonth().toString()
            + "-" + timestamp.getDate().toString()).toString()
    return fulltime;
})

hbs.handlebars.registerHelper('isAdmin', function (value) {
    // console.log("Role " + value.accType);
    return value.accType === 0 ? "admin" : "user"
})

hbs.handlebars.registerHelper('isEmpty', function (value) {
    // console.log("Role " + value.accType);
    return value.length === 0
})

hbs.handlebars.registerHelper('eachInMap', function ( map, block ) {
    var out = '';
    Object.keys( map ).map(function( prop ) {
       out += block.fn( {key: prop, value: map[ prop ]} );
    });
    return out;
 } );

 hbs.handlebars.registerHelper('jsonify', function(ob){
    return JSON.stringify(ob)
 })


 hbs.handlebars.registerHelper('dejsonify', function(ob){
    console.log("json string " + ob)
    return JSON.parse(ob)
 })

 hbs.handlebars.registerHelper('getLength', function(array, id){
    if(Array.isArray(array))
        return array.length
    return 0
 })

 hbs.handlebars.registerHelper('getUserName', async function(id){
    const taiKhoan = await TaiKhoan.findById(id)
    return taiKhoan === null ?"": taiKhoan.HoTen
 })

app.set('view engine', 'hbs');

app.set('port', process.env.PORT || 5000);
app.use(morgan('dev'));
app.use(flash());

app.use(fileUpload());

db.mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(app.get('port'),
            console.log(`Server is listening on port ${app.get('port')}`));
    }).catch((err) => console.log(err));

const TaiKhoan = db.taiKhoan;

// Thiet lap doc thong tin gui tu Form POST
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Thiet lap  doc cookies (su dung cho viec auth)
app.use(cookieParser());

// Thiet lap su dung session va luu tru session tren Redis
app.use(session({
    secret: SESSION_SECRET,
    store: new redisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // if true only transmit cookie over https
        httpOnly: true, // prevent client side JS from reading the cookie
        maxAge: 120 * 60 * 1000 // 20 minutes
    },
}));

// Thiet lap su dung passport
require('./controller/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Su dung connect-flash luu tru flash message trong session
app.use(flash());

app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});

// Su dung middlewares khoi tao gia tri
app.use(function (req, res, next) {
    res.locals.isLoggedIn = req.isAuthenticated();
    if (req.body.keepLoggedIn != "") {
        req.session.cookie.maxAge = null;
    }
    next();
});


app.use(express.static(__dirname + '/staticWeb'));
app.use(express.static(__dirname + '/upload'));

app.get('/insertTaiKhoan', (req, res) => {
    const taiKhoan = new TaiKhoan({
        accType: 0,
        email: 'tuanquan127@gmail.com',
        SoDt: '0776375891',
        password: '1234'
    });
    taiKhoan.save()
        .then((result) => res.send(result))
        .catch((err) => console.log(err));
})

app.get('/insertVeXe', (req,res) =>{
    const veXe = new VeXe({
        MaChuyenXe:'63afeddd4e1487e2f87dcfe9',
        MaTaiKhoan: '63a49ace9a39ac75f034c809',
        SoLuongGheDat: 4,
        TongTien: 1234000*4,
        TinhTrang: 1,
        DanhSachGheNgoi: [7, 8, 9, 10]
      });

    veXe.save()
    .then((result) => res.send(result))
        .catch((err) => console.log(err));
})


app.get('/')
app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})
app.use('/', require('./routes/homeRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/AboutUs', require('./routes/aboutUsRoutes'));
app.use('/BookTickets', require('./routes/searchRoute'));
app.use('/Contact', require('./routes/contactRoutes'));

// Thong tin cho booking
app.use('/nhaXe', require('./routes/nhaXeRoute'));
app.use('/chuyenXe', require('./routes/chuyenXeRoute'));
app.use('/veXe', require('./routes/veXeRoute'));

//Hien loi
app.use('/Error', require('./routes/errorRoutes'));

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', (req, res) => {
    // console.log(res.locals)
    res.render('Error', {error: res.locals.errorString});
});
