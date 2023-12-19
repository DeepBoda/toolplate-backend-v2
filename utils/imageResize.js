const AWS = require("@aws-sdk/client-s3");
const sharp = require("sharp");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
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
      quality: 90, // Maximum quality (0-100)
      lossless: true, // Set to true for lossless compression
      effort: 0, // Trade-off between file size and performance (0-6)
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
    console.log("Avif image resize and upload successfully!");

    return true;
  } catch (err) {
    console.error("Error resizing and uploading images", err);
    return false;
  }
};

exports.resizeAndUploadWebP = async (sizes, originalImageS3Link, keyPrefix) => {
  try {
    // Fetch the original image from the provided S3 link (assuming it's a publicly accessible URL)
    const response = await axios.get(originalImageS3Link, {
      responseType: "arraybuffer",
    });
    const originalImageBuffer = Buffer.from(response.data, "binary");

    const pipeline = sharp(originalImageBuffer).webp({
      quality: 90, // Adjust the quality as needed (0-100)
      alphaQuality: 100, // For images with transparency
      lossless: true, // Set to true for lossless compression (ignores quality)
      smartSubsample: true, // Better quality downscaling at lower sizes
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
        Key: `${keyPrefix}_${size.width}_${size.height}.webp`,
        Body: resizedBuffer,
        ACL: "public-read",
        ContentType: "image/webp",
        Metadata: {
          "Cache-Control": "public, max-age=31536000",
          "Content-Disposition": `inline; filename="${keyPrefix}_toolplate.webp"`,
        },
      });
    });

    await Promise.all(uploadPromises);
    console.log("WebP images resized and uploaded successfully");

    return true;
  } catch (err) {
    console.error("Error resizing and uploading WebP images", err);
    return false;
  }
};

exports.convertToAvifAndUpload = async (file) => {
  try {
    // Fetch the original image from the provided S3 link (assuming it's a publicly accessible URL)
    const response = await axios.get(file.location, {
      responseType: "arraybuffer",
    });
    const originalImageBuffer = Buffer.from(response.data, "binary");

    const pipeline = sharp(originalImageBuffer)
      .avif({
        quality: 90,
        lossless: false, // Consider using lossy compression for smaller file sizes
        speed: 6, // Trade-off between compression speed and efficiency
      })
      .sharpen();

    // Convert the image to AVIF format
    const avifBuffer = await pipeline.toBuffer();

    // Generate a unique file name for the S3 object
    const uniqueFileName = `overview-${uuidv4()}`;

    // Upload the AVIF image to S3
    await s3Client.putObject({
      Bucket: process.env.BUCKET,
      Key: `${uniqueFileName}.avif`,
      Body: avifBuffer,
      ACL: "public-read",
      ContentType: "image/avif",
      Metadata: {
        "Cache-Control": "public, max-age=31536000",
        "Content-Disposition": `inline; filename="${uniqueFileName}.avif"`,
      },
    });

    const cdn =
      process.env.NODE_ENV === "production"
        ? "https://cdn.toolplate.ai"
        : "https://staging-cdn.toolplate.ai";

    return {
      originalUrl: file.location, // Update with the correct extension
      avifUrl: `${cdn}/${uniqueFileName}.avif`,
    };
  } catch (err) {
    console.error("Error converting and uploading image to AVIF", err);
    return false;
  }
};
