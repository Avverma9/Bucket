
const express = require('express')
const mongoose = require('mongoose');
const crypto = require("crypto"); // Node.js crypto module for generating random tokens
const nodemailer = require("nodemailer"); // npm package for sending emails
const bucketModel = require("./models/bucketModel")
const userModel = require("./models/userModel")
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { S3Client, PutObjectCommand, Type } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');

const app = express();
const server = createServer(app)
const io = new Server(server);

const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb+srv://Avverma:Avverma95766@avverma.2g4orpk.mongodb.net/storage';
const AWS_BUCKET_NAME = 'avvermabucket';
const AWS_ACCESS_KEY_ID = 'AKIARN4LFJPVCZH7XWS7';
const AWS_SECRET_ACCESS_KEY = 'b00JnxkIKa32KRRri6d8TctEWCh+BBZmwTz6i1y8';
const AWS_REGION = 'ap-south-1'; // Update this to the appropriate region for your S3 bucket
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});


app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
}).array('images', 10);

//============================================ User Controller============================================//
app.post("/register",upload, async (req,res) =>{
  const {name,email,mobile,password} =req.body
  const images = req.files.map(file => file.location);
  const user = new userModel({name,email,mobile,password,images})
 await user.save();
 io.emit("userRegistered",user)
 res.json(user)
})
// // Set up multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Define the destination folder where images will be stored
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     // Generate a unique filename for each uploaded image
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // Create multer instance with the defined storage
// const upload = multer({ storage: storage });

// // Your user registration route with multer middleware
// app.post("/register", upload.array("images", 5), async (req, res) => {
//   const { name, email, mobile, password } = req.body;
//   const images = req.files.map((file) => file.path); // Use file.path to get the stored image paths
//   // Process the user data and save to the database
//   // ...

//   res.json({ success: true });
// });

//=======================================user login======================================
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json({ message: "Sign-in successful", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the user" });
  }
});

//==================================================STORE ON BUCKET===============================================//
app.post('/bucket/:userId', upload, async (req, res) => {
  try{
  const {userId} = req.params
  const {filename} = req.body;
  const images = req.files.map(file => file.location);
  const bucket = new bucketModel({ filename,images, userId});
  await bucket.save();
  io.emit('recordAdded', bucket);
  res.json({bucket});
  }catch (error){
console.log(error);
  }
});

//============================================================
app.get('/count', async (req, res) => {
  try {
    const count = await bucketModel.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error counting data:', error);
    res.status(500).json({ error: 'An error occurred while counting data.' });
  }
});


//===========================================GET BUCKETS====================================================//
app.get('/bucket/:userId', async (req, res) => {
  try{
    const userId= req.params.userId
  const buckets = await bucketModel.find({userId});
  const bucketCount = await bucketModel.countDocuments({userId})
  if(!buckets){
    console.log("there is no any data here")
  }
  res.json({buckets,bucketCount});
}catch(error){
  console.log(error);
}
});




//==============================================DEEETE BUCKET=============================================//
// DELETE a bucket record by ID
app.delete('/:id', async (req, res) => {
  try {
    const deletedBucket = await bucketModel.findByIdAndDelete(req.params.id);
    if (!deletedBucket) {
      throw new Error('Item not found.');
    }
    const bucketCount = await bucketModel.countDocuments();
    res.json({ bucketCount });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete the item.' });
  }
});
//==============================forget Your password==========================

app.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;

  try {
  
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();
    const transporter = nodemailer.createTransport({
    
    });

    const mailOptions = {
      from: "av95766@gmail.com",
      to: user.email,
      subject: "Password Reset Request",
      text: `Hello ${user.name},\n\n`
        + "You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n"
        + "Please click on the following link, or paste this into your browser to complete the process:\n\n"
        + `http://avbucket.netlify.app/reset-password/${token}\n\n`
        + "If you did not request this, please ignore this email and your password will remain unchanged.\n",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "An error occurred while sending the email" });
      }

      console.log("Email sent:", info.response);
      res.json({ message: "Password reset email sent successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
