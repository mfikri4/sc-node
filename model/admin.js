const mongoose = require('mongoose');

const Admin = mongoose.model('Admin',{
    username: {
        type: String,
        require: true, 
        min: 6,
        max: 255
    },
    password: {
        type: String,
        require: true
    }
});

//        const adm1 = new Admin ({
//        username: 'Azim',
//      password: 'admin',
//      });

//      adm1.save().then((admin) => console.log(admin));
module.exports = Admin;