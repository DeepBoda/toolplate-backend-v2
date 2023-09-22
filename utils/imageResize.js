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

    // Create a pipeline for parallel image processing
    const pipeline = sharp(originalImageBuffer);

    // Configure AVIF settings
    pipeline.avif({
      quality: 100,
      speed: 6,
    });

    // Resize the original image and create resized versions in parallel
    const resizePromises = sizes.map((size) => {
      return pipeline
        .clone()
        .resize(size.width, size.height, {
          fit: "inside",
          withoutEnlargement: true,
          progressive: true,
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen();
    });

    const resizedImages = await Promise.all(resizePromises);

    // Upload the original image and resized versions to S3 in parallel
    const uploadPromises = sizes.map(async (size, index) => {
      const resizedBuffer = await resizedImages[index].toBuffer();
      return s3Client
        .putObject({
          Bucket: process.env.BUCKET,
          Key: `${keyPrefix}_${size.width}_${size.height}.avif`,
          Body: resizedBuffer,
          ACL: "public-read",
          ContentType: "image/avif",
        })
        .promise();
    });

    await Promise.all(uploadPromises);
    console.log("success");

    return true; // Successfully uploaded and resized images
  } catch (err) {
    console.error("Error resizing and uploading images", err);
    return false;
  }
};
