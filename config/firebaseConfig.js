const admin = require("firebase-admin");

//TODO replace this cred file using your project firebase file
const credentials = require("./nodetemp-b8b1c-firebase-adminsdk-zix16-378fcc9f95.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

module.exports = admin;
