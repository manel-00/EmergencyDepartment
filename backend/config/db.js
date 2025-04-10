const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables


        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then (()=>{
            console.log("DB Connected");
        })
        .catch ((err) => console.log(err));
   


//module.exports = connectDB;
