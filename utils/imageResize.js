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

    // Create a pipeline for parallel image processing
    const pipeline = sharp(originalImageBuffer);

    // Configure AVIF settings
    pipeline.avif({
      quality: 100, // Adjust quality as needed (0-100)
      speed: 8, // Adjust speed for performance vs. size trade-off (0-8)
    });

    // Resize the original image and create resized versions in parallel
    const resizePromises = sizes.map((size) => {
      return pipeline
        .clone() // Clone the pipeline to avoid modifying the original
        .resize(size.width, size.height, {
          fit: "inside", // Maintain aspect ratio, fit inside specified dimensions
          withoutEnlargement: true,
          progressive: true, // Enable progressive loading
          kernel: sharp.kernel.lanczos3, // Set resampling kernel for quality
        })
        .sharpen(); // Apply sharpness to enhance quality
    });

    const resizedImages = await Promise.all(resizePromises);

    // Upload the original image and resized versions to S3 in parallel
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
