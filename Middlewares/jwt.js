const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

const jwtAuthMiddleware = async (req, res, next) => {
    try {
        // Check if token exists in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Authentication token not found." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from decoded token
        const user = await User.findById(decoded.id); // Await the result
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error("JWT Authentication Error:", err);
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

// Token Generator Function
const generateToken = (userData) => {
    // Generate a token with a 1-hour expiration
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = { jwtAuthMiddleware, generateToken };
