const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const Admin     = require('../model/admin');

const register  = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedPass){
        if(err){
            res.json({
                error: err
            })
        }
    })

    let user = new Admin({
        username: req.body.username,
        password: hashedPass
    })

    user.save().then(user => {
        res.json({
            message: 'User berhasil ditambah!'
        })
    }).catch(error =>{
        res.json({
            message: 'Tambah user gagal!'
        })
    })
}






// async function Login(req, res){

//     const username = req.body.username;
//     const password = req.body.password;

//     try {
//         const user = await User.findOne({username: username, password: password}).exec();

//         if(user === null) res.status(401).json({status:true, message: "Usernam or password is not valid."});
//         console.log('user', user);
//         const access_token = jwt.sign({sub:username}, process.env.JWT_ACCESS_SECRET,{expiresIn: process.env.JWT_ACCESS_TIME});
//         console.log('access_token', access_token);
//         const refresh_token = GenerateRefreshToken(username);
//         return res.json({status:true, message: "Login Success", data:{access_token, refresh_token}});
        
//     } catch (error) {
//         return res.status(401).json({status:true, message: "Login Failed"});
//     }

// }

// async function Register(req, res){
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     });

//     try {
//         const saved_user = await user.save();
//         res.json({status:true, message: "Registered successfully", data: saved_user});
//     } catch (error) {
//         res.status(400).json({status: false, message: "Something went wrong", data: error });
//     }
// }

// async function Logout (req, res) {
//     const user_id = req.userData.sub;
//     const token = req.token;

//     // remove the refresh token
//     await redis_client.del(user_id.toString());

//     // blacklist current access token
//     await redis_client.set('BL_' + user_id.toString(), token);
    
//     return res.json({status: true, message: "success."});
// }


// function GetAccessToken (req, res) {
//     const user_id = req.userData.sub;
//     const access_token = jwt.sign({sub: user_id}, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TIME});
//     const refresh_token = GenerateRefreshToken(user_id);
//     return res.json({status: true, message: "success", data: {access_token, refresh_token}});
// }

// function GenerateRefreshToken(user_id) {
//     const refresh_token = jwt.sign({ sub: user_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
    
//     redis_client.get(user_id.toString(), (err, data) => {
//         if(err) throw err;

//         redis_client.set(user_id.toString(), JSON.stringify({token: refresh_token}));
//     })

//     return refresh_token;
// }

module.exports = {
    register
    //Register, Login, Logout, GetAccessToken
}