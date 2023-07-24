const { S3 } = require("@aws-sdk/client-s3");

exports.s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.Bucket,
  region: process.env.AWS_REGION,
});
