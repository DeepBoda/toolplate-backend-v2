const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const { s3 } = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    metadata: function (req, file, cb) {
      // Add custom metadata or validation here if needed
      const metadata = {
        fieldName: file.fieldname,
        "Cache-Control": "public, max-age=31536000", // Adjust the max-age as needed
        "Content-Disposition": `inline; filename="${file.originalname}"`,
      };
      cb(null, metadata);
    },

    key: function (req, file, cb) {
      // Generate a unique file name for the S3 object
      const uniqueFileName = uuidv4();
      cb(null, path.join(uniqueFileName, path.extname(file.originalname)));
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
        throw err; // Throw the error to be caught and handled by the caller
      } else {
        console.log("Files deleted successfully", data.Deleted);
      }
    });
  } catch (error) {
    console.error(error);
    next(error); // Pass the error to Express error handling
  }
};

module.exports = { upload, deleteFilesFromS3 };
