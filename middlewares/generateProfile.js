const md5 = require("md5");
const { S3 } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.BUCKET,
  region: process.env.AWS_REGION,
});

// Function to generate a random background color
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    color += letters[randomIndex];
  }

  return color;
}

exports.generateProfilePic = async (username) => {
  try {
    let imageText = "";

    if (username.includes(" ")) {
      // If the username contains spaces (full name), use the first character from each word
      const words = username.split(" ");
      imageText = words.map((word) => word[0].toUpperCase()).join("");
    } else {
      // If the username is a single word, use the first character only
      imageText = username[0].toUpperCase();
    }

    // Create a colored background image with initials
    const imageWidth = 500;
    const imageHeight = 500;
    const backgroundColor = getRandomColor(); // Random background color
    const fontSize = 250;

    const image = await sharp({
      create: {
        width: imageWidth,
        height: imageHeight,
        channels: 4, // Set channels to 4 for RGBA (includes transparency)
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Set initial background as transparent
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">
              <rect width="100%" height="100%" fill="${backgroundColor}"/>
              <text
                x="50%"
                y="65%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-family="Arial"
                font-size="${fontSize}px"
                fill="#ffffff"
              >
                ${imageText}
              </text>
            </svg>`
          ),
        },
      ])
      .toFormat("webp") // Convert the image to WEBP format
      .toBuffer();

    // Upload the image to Amazon S3 with the correct Content-Disposition header
    const uploadParams = {
      Bucket: process.env.BUCKET,
      Key: `profile_pics/${md5(username)}.webp`, // Use the hashed username as the filename with .webp extension
      Body: image,
      ContentType: "image/webp", // Set the Content-Type as image/webp for WEBP format
      ContentDisposition: "inline", // Set the Content-Disposition header to "inline" to display the image in the browser
    };

    // Upload the image and handle success without any data response
    await s3.putObject(uploadParams);

    // Construct the URL for the uploaded image
    const imageURL = `${process.env.BUCKET_URL}/${uploadParams.Key}`;
    console.log(imageURL); // Check the value of imageURL

    return imageURL;
  } catch (error) {
    console.error("Error uploading the image to S3:", error);
    throw error;
  }
};
