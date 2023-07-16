const mongoose = require("mongoose")

const BucketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    filename: { type: String, required: false },
    images: { type: [String], required: false },
  });
  
  module.exports= mongoose.model('bucket', BucketSchema);
  