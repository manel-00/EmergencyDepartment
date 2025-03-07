const jwt = require("jsonwebtoken");
const secretKey = "abc123";  // Secret key for signing JWT

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];  // Extract token from header

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, secretKey);

    // Attach user data to the request
    req.user = decoded;

    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
