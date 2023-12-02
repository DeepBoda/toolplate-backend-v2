const admin = require("firebase-admin");

const credentials = require("./toolplate-28af5-firebase-adminsdk-x2s3a-41e579504f.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

module.exports = admin;
