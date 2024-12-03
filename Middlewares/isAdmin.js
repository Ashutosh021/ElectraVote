const isAdmin = (req, res, next) => {
    try {
        const user = req.user; // Ensure this comes from jwtAuthMiddleware
        if (user && user.role === "admin") {
            return next(); // Proceed if user is admin
        }

        // Non-admin access
        res.status(403).json({ error: "Access denied. Admins only." });
    } catch (err) {
        console.error("Error in isAdmin middleware:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = isAdmin;
