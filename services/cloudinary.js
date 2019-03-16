const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

var storageProfilePic = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'ironhack-rooms-app/profiles', // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    
    cb(null, file.originalname.split('.')[0]); // Split porque o final do arquivo ta indo no nome do arquivo (nomearquivo.jpg.jpg) The file on cloudinary would have the same name as the original file name
  }
});

var storageRoomPic = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'ironhack-rooms-app/rooms', // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    cb(null, file.originalname.split('.')[0]); // Split porque o final do arquivo ta indo no nome do arquivo (nomearquivo.jpg.jpg) The file on cloudinary would have the same name as the original file name
  }
});

const uploadCloudProfile = multer({ storage: storageProfilePic });
const uploadCloudRoom = multer({ storage: storageRoomPic });


module.exports = {
  uploadCloudProfile, 
  uploadCloudRoom
};