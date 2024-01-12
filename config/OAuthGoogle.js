const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const credentials = require("./client_secret_271202224878-3tprbnlncit92e9cnuq7goqclccgtns0.apps.googleusercontent.com.json");

const client = new OAuth2Client({
  clientId: credentials.client_id,
  clientSecret: credentials.client_secret,
  projectId: credentials.project_id,
  credentials: credentials,
});

const getCerts = async () => {
  const response = await axios.get(
    "https://www.googleapis.com/oauth2/v1/certs"
  );
  client.certificateCache = response.data;
  return response.data;
};

const verifyToken = async (token) => {
  try {
    await getCerts();

    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken) {
      throw createError(400, "Invalid Token");
    }

    const jwtHeader = decodedToken.header;
    const kid = jwtHeader.kid;
    const pem = client.certificateCache[kid];

    if (!pem) {
      console.error(`No pem found for kid: ${kid}`);
      // Handle the error appropriately
      throw createError(500, "Internal Server Error");
    }

    // Manually extract the public key from the certificate
    const publicKey = pem.split("\n").slice(1, -2).join("");

    // Verify the JWT signature using the manually extracted public key
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: credentials.client_id,
      publicKey,
    });

    const payload = ticket.getPayload();

    return {
      success: true,
      payload,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};

module.exports = { verifyToken, getCerts };
