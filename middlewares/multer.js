var multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const { s3 } = require("../config/aws");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
});

const deleteFilesFromS3 = (urls) => {
  urls.map((url) => {
    const key = url.split(`${process.env.BUCKET_URL}/`)[1];
    console.log(key);
    s3.deleteObject({ Bucket: process.env.BUCKET, Key: key }, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log("File deleted successfully", data);
    });
  });
};

module.exports = { upload, deleteFilesFromS3 };
