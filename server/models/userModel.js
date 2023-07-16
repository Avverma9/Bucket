const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    "name":String,
     "mobile":Number,
     "email":String,
     "password":String,
     "images":[String],
    

})

module.exports= mongoose.model("user",userSchema)