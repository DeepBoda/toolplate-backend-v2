const multerS3 = require("multer-s3");
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
      const uniqueFileName =
        Date.now().toString() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueFileName + path.extname(file.originalname));
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type based on file extension
  }),
});

const deleteFilesFromS3 = (urls) => {
  try {
    const keys = urls.map((url) => url.split(`${process.env.BUCKET_URL}/`)[1]);
    if (keys.length === 0) {
      return; // No files to delete, return early
    }
    const payload = {
      Bucket: process.env.BUCKET,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    };
    s3.deleteObjects(payload, (err, data) => {
      if (err) {
        console.error("Error deleting objects:", err);
      } else {
        console.log("Files deleted successfully", data.Deleted);
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
module.exports = { upload, deleteFilesFromS3 };
