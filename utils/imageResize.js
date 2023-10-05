const AWS = require("@aws-sdk/client-s3");
const libvips = require("libvips");
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

    // Create a LibVIPS image object from the original image buffer
    const image = libvips.Image.newFromBuffer(originalImageBuffer);

    // Create a pipeline to resize and sharpen the image
    const pipeline = image.pipeline();
    sizes.forEach((size) => {
      pipeline.resize(size.width, size.height, {
        fit: "inside",
        withoutEnlargement: true,
        kernel: "lanczos3",
      });
    });
    pipeline.sharpen();

    // Process the pipeline and get the resized image buffer
    const resizedImageBuffer = await pipeline.getBuffer();

    // Upload the resized image to S3
    const uploadPromise = s3Client.putObject({
      Bucket: process.env.BUCKET,
      Key: `${keyPrefix}_${sizes[0].width}_${sizes[0].height}.avif`,
      Body: resizedImageBuffer,
      ACL: "public-read",
      ContentType: "image/avif",
      Metadata: {
        "Cache-Control": "public, max-age=31536000",
        "Content-Disposition": `inline; filename="${keyPrefix}_toolplate.avif"`,
      },
    });

    await uploadPromise;
    console.log("success");

    return true;
  } catch (err) {
    console.error("Error resizing and uploading images", err);
    return false;
  }
};
