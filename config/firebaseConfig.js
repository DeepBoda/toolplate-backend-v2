const admin = require("firebase-admin");

const credentials = require("./toolplate-28af5-firebase-adminsdk-x2s3a-dfecc50c6a.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

module.exports = admin;
