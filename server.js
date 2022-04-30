require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const salt = 10;
const AuthRoute     = require('./routes/auth')
const {body, validationResult, check } = require('express-validator');
const seesion = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const jwt = require('jsonwebtoken');

//model
require('./utils/db');
const Admin = require('./model/admin');

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(
    seesion({
        cookie: {maxAge:6000},
        secret: 'secret',
        resave: true,
        saveUninitialized:true,
    })
);
app.use(flash());

const PORT = process.nextTick.PORT||8080

//log middleware
app.use(express.json());
//log requests
app.use(morgan('tiny'));
//log body-parser
app.use(bodyparser.urlencoded({extended:true}));
//set view engine
app.set("view engine","ejs")
//load assets
app.use('/css',express.static(path.resolve(__dirname,"assets/css")))
app.use('/img',express.static(path.resolve(__dirname,"assets/img")))
app.use('/js',express.static(path.resolve(__dirname,"assets/js")))

app.get('/admin/login', (req, res)=>{
    res.render('login-adm');
});
app.get('/user/login', (req, res)=>{
    res.render('login-us');
});

// login 
app.post('/signin-adm',async(req,res)=>{
    const {username,password}=req.body;
    const response = await verifyAdmLogin(username,password);
    if(response.status==='ok'){
        res.cookie('token',token,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });  // maxAge: 2 hours
        res.redirect('/admin');
    }else{
        res.json(response);
    }
});
// user login function
const verifyAdmLogin = async (username,password)=>{
    try {
        const adm = await Admin.findOne({username}).lean()
        if(!adm){
            return {status:'error',error:'user not found'}
        }
        if(await bcrypt.compare(password,adm.password)){
            token = jwt.sign({id:adm._id,username:adm.username,type:'admin'},process.env.JWT_ACCESS_SECRET,{ expiresIn: '2h'})
            return {status:'ok',data:token}
        }
        return {status:'error',error:'invalid password'}
    } catch (error) {
        console.log(error);
        return {status:'error',error:'timed out'}
    }
}
const verifyAdmToken = (token)=>{
    try {
        const verify = jwt.verify(token,process.env.JWT_ACCESS_SECRET);
        if(verify.type==='admin'){return true;}
        else{return false};
    } catch (error) {
        console.log(JSON.stringify(error),"error");
        return false;
    }
}
// login User
app.post('/signin-us',async(req,res)=>{
    const {username,password}=req.body;
    const response = await verifyUserLogin(username,password);
    if(response.status==='ok'){
        res.cookie('token',token,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });  // maxAge: 2 hours
        res.redirect('/user');
    }else{
        res.json(response);
    }
});
// user login function
const verifyUserLogin = async (username,password)=>{
    try {
        const adm = await Admin.findOne({username}).lean()
        if(!adm){
            return {status:'error',error:'user not found'}
        }
        if(await bcrypt.compare(password,adm.password)){
            token = jwt.sign({id:adm._id,username:adm.username,type:'user'},process.env.JWT_ACCESS_SECRET,{ expiresIn: '2h'})
            return {status:'ok',data:token}
        }
        return {status:'error',error:'invalid password'}
    } catch (error) {
        console.log(error);
        return {status:'error',error:'timed out'}
    }
}
const verifyUserToken = (token)=>{
    try {
        const verify = jwt.verify(token,process.env.JWT_ACCESS_SECRET);
        if(verify.type==='user'){return true;}
        else{return false};
    } catch (error) {
        console.log(JSON.stringify(error),"error");
        return false;
    }
}

app.get('/register', (req, res)=>{
    res.render('register');
});
//signup
app.post('/signup',
    [
        body('username').custom(async(value) => {
            const duplikat = await Admin.findOne({ username: value});
            if(duplikat){
                throw new Error('Username sudah digunakan!')
            }
            return true;
        }),
    ], 
    async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.render('register',{
                errors: errors.array(),
            });
        }else{
            const {username,password:plainTextPassword}=req.body;
            const password = await bcrypt.hash(plainTextPassword,salt);
            try {
                const response = await Admin.insertMany({
                    username,
                    password
                })
                req.flash('msg', 'Data User berhasil ditambahkan!');
                return res.redirect('/login');
            } catch (error) {
                console.log(JSON.stringify(error));
                if(error.code === 11000){
                    return res.send({status:'error',error:'username already exists'})
                }
                throw error
            }
        }

})

app.get('/logout', function (req, res) {
    req.logout();
    res.status(200).json({
       status: 'Bye!'
    });
});

app.post("/admin/logout",  (req, res) => {
    try {
        res.clearCookie("jwt");
        console.log("Logout Success");
        res.redirect('/admin/login');
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/user/logout",  (req, res) => {
    try {
        res.clearCookie("jwt");
        console.log("Logout Success");
        res.redirect('/user/login');
    } catch (error) {
        res.status(400).send(error);
    }

});

app.get('/user', async(req, res)=>{
    const {token}=req.cookies;
    if(verifyUserToken(token)){
        const admins = await Admin.find();
        return res.render('user',{
            admins,
            msg: req.flash('msg', ' data user muncul!'),
        })
    }else{
        res.redirect('/user/login')
    }
});
app.get('/admin',async(req, res)=>{    
    const {token}=req.cookies;
        if(verifyAdmToken(token)){
            const admins = await Admin.find();
            return res.render('admin',{
                admins,
                msg: req.flash('msg', ' data user muncul!'),
            })
        }else{
            res.redirect('/admin/login')
        }
});
//add
app.get('/admin/add',(req, res)=>{
    res.render('add');
}); 
//add data
app.post('/admin',
    [
        body('username').custom(async(value) => {
            const duplikat = await Admin.findOne({ username: value});
            if(duplikat){
                throw new Error('Username sudah digunakan!')
            }
            return true;
        }),
    ], 
    (req, res)=>{    
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.render('add',{
                errors: errors.array(),
            });
        }else{
            Admin.insertMany(req.body, (error, result) => {
                req.flash('msg', 'Data User berhasil ditambahkan!');
                res.redirect('/admin');
            });
        }
    }
);
//edit
app.get('/admin/edit/:username', async (req, res)=>{
    const admins = await Admin.findOne({username: req.params.username});
    res.render('edit',{
        admins,
        msg: req.flash('msg', 'Edit data user muncul!'),
    })
});
//edit data
app.post('/admin/edit',
    [
        body('username').custom(async(value, {req}) => {
            const duplikat = await Admin.findOne({ username: value});
            if(value !== req.body.username){
                throw new Error('Username sudah digunakan!')
            }
            return true;
        }),
    ], 
    (req, res)=>{    
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.render('edit',{
                errors: errors.array(),
            });
        }else{
            Admin.updateOne(
                { _id: req.body._id },
                {
                    $set: {
                        username: req.body.username,
                        password: req.body.password,
                    },
                }
            ).then((result) => {
            req.flash('msg', 'Data User berhasil diedit!');
            res.redirect('/admin');
            });
        }
    }
);
//delete
app.get('/admin/delete/:username', async (req, res)=>{
    const admins = await Admin.findOne({username: req.params.username});
    
    if(!admins){
        req.statusCode(404);
        req.sessionID('<h1>404</h1>');
    }else{
        Admin.deleteOne({username: admins.username}).then((result) =>{
        req.flash('msg', 'Data User berhasil diedit!');
        res.redirect('/admin');
        });
    }
});

//ROUTES
const auth_routes = require('./routes/auth');
const user_routes = require('./routes/user.route');
const { insertMany } = require('./model/admin');

app.use('/api', AuthRoute);
app.use('/v1/auth', auth_routes);
app.use('/v1/user', user_routes);


app.listen(3000,()=> { console.log(`Server is running on http://localhost:${PORT}`)}); 