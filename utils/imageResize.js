const AWS = require("@aws-sdk/client-s3");
const sharp = require("sharp");
require("dotenv").config();
const axios = require("axios");
const s3Client = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.resizeAndUploadImage = async (
  sizes,
  originalImageS3Link,
  keyPrefix
) => {
  try {
    // Fetch the original image from the provided S3 link (assuming it's a publicly accessible URL)
    const response = await axios.get(originalImageS3Link, {
      responseType: "arraybuffer",
    });
    const originalImageBuffer = Buffer.from(response.data, "binary");

    const pipeline = sharp(originalImageBuffer).avif({
      quality: 90,
      speed: 0,
    });

    const resizePromises = sizes.map(async (size) => {
      const sizePipeline = pipeline
        .clone()
        .resize(size.width, size.height, {
          fit: "inside",
          withoutEnlargement: true,
          progressive: true,
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen();
      const resizedBuffer = await sizePipeline.toBuffer();
      return { size, buffer: resizedBuffer };
    });

    const resizedImages = await Promise.all(resizePromises);

    const uploadPromises = sizes.map(async (size, index) => {
      const resizedBuffer = resizedImages[index].buffer;
      return s3Client.putObject({
        Bucket: process.env.BUCKET,
        Key: `${keyPrefix}_${size.width}_${size.height}.avif`,
        Body: resizedBuffer,
        ACL: "public-read",
        ContentType: "image/avif",
        Metadata: {
          "Cache-Control": "public, max-age=31536000",
          "Content-Disposition": `inline; filename="${keyPrefix}_toolplate.avif"`,
        },
      });
    });

    await Promise.all(uploadPromises);
    console.log("success");

    return true;
  } catch (err) {
    console.error("Error resizing and uploading images", err);
    return false;
  }
};
