const allowedIPs =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_ALLOWED_IPS.split(",")
    : process.env.DEV_ALLOWED_IPS.split(",");

const ipWhitelist = async (req, res, next) => {
  try {
    const clientIP = req.ip;

    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        status: 403,
        message: "Access denied. Your IP is not whitelisted.",
      });
    }
  } catch (error) {
    console.error("Error in IP whitelist middleware:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = ipWhitelist;
