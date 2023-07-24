var multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const { s3 } = require("../config/aws");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.Bucket,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
});

module.exports = upload;
