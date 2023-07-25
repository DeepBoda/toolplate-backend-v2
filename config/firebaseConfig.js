const admin = require("firebase-admin");

//TODO replace this cred file using your project firebase file
const credentials = require("./toolplate-28af5-firebase-adminsdk-x2s3a-dfecc50c6a.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

module.exports = admin;
