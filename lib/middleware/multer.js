

var path = require("path");
var multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    let file_name =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    req.newFile_name = file_name;
    callback(null, file_name);
  },
});

var profileStorage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './profilePhotos');
  },
  filename: function (req, file, callback) {
    let file_name =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    req.newFile_name = file_name;
    callback(null, file_name);
  },
});

var upload = multer({
  storage: storage,
  
}).single("imageURL");

var uploadProfilePhoto = multer({
  storage: profileStorage ,
  
}).single("imageURL");

module.exports = {
  upload,
  uploadProfilePhoto
};
// const videoStorage = multer.diskStorage({
//   destination: 'videos', // Destination to store video 
//   filename: (req, file, cb) => {
//       cb(null, file.fieldname + '_' + Date.now() 
//        + path.extname(file.originalname))
//   }
// });

// const videoUpload = multer({
  //   storage: videoStorage,
  //   limits: {
    //   fileSize: 10000000 // 10000000 Bytes = 10 MB
    //   },
    //   fileFilter(req, file, cb) {
      //     // upload only mp4 and mkv format
//     if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
//        return cb(new Error('Please upload a video'))
//     }
//     cb(undefined, true)
//  }
// }).single("videoURL")

// function checkFileType(file, callback) {
//     const fileTypes = /jpeg|jpg|png|pdf|txt|doc|docx/;
//     const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
//     console.log(extName)
//     if (extName) {
//         return callback(null, true);
//     } else {
//         callback('Error:Images only!')
//     }
// }

