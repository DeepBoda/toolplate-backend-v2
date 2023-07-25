const admin = require("firebase-admin");

//TODO replace this cred file using your project firebase file
const credentials = require("./toolplate-firebase-adminsdk-hg0f1-caf6ac9338.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

module.exports = admin;
