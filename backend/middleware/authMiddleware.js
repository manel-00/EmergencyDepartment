const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

module.exports = authenticateUser;
