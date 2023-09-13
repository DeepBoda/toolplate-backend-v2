"use strict";
const AWS = require("@aws-sdk/client-s3");
const sharp = require("sharp");
require("dotenv").config();
const axios = require("axios");
const s3Client = new AWS.S3({
  region: process.env.AWS_REGION, // For example, 'us-east-1'
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

    // Resize the original image and create resized versions
    const resizePromises = sizes.map((size) => {
      return sharp(originalImageBuffer)
        .resize(size.width, size.height, {
          fit: "cover", // Use 'inside' to avoid stretching or cropping
          withoutEnlargement: true, // Do not enlarge the image if it's smaller than the target size,
          centerSampling: true,
        })
        .toFormat("avif")
        .avif({
          quality: 100,
          reductionEffort: 6,
          smartSubsample: true,
          force: true,
        })
        .toBuffer();
    });

    const resizedImages = await Promise.all(resizePromises);

    // Upload the original image and resized versions to S3
    const uploadPromises = sizes.map((size, index) => {
      return s3Client.putObject({
        Bucket: process.env.BUCKET,
        Key: `${keyPrefix}_${size.width}_${size.height}.avif`,
        Body: resizedImages[index],
        ACL: "public-read",
        ContentType: "image/avif",
      });
    });

    await Promise.all(uploadPromises);
    console.log("success");

    return true; // Successfully uploaded and resized images
  } catch (err) {
    console.error("Error resizing and uploading images", err);

    return false;
  }
};
