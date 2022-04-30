const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/scnode',
    { useUnifiedTopology: true, 
        useNewUrlParser: true},
    () => {console.log('connected to mongodb.');}
)
