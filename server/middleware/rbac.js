/**
 * Protect middleware
 * Minimal version: ensuring some form of user identity exists.
 * In a real app, this would verify a JWT.
 */
const protect = (req, res, next) => {
    // Check for user populated by potential future JWT middleware,
    // or fallback to development headers
    const userID = req.user ? (req.user.userid || req.user.UserID) : (req.headers['x-user-id'] || req.headers['X-User-Id']);
    const roleID = req.user ? (req.user.roleid || req.user.RoleID) : (req.headers['x-user-role'] || req.headers['X-User-Role']);

    if (!userID && !req.user) {
        return res.status(401).json({ error: "Not authorized to access this resource." });
    }

    // Populate req.user if not present (for development simplicity)
    if (!req.user && userID) {
        req.user = { 
            UserID: parseInt(userID), 
            userid: parseInt(userID),
            RoleID: parseInt(roleID),
            roleid: parseInt(roleID)
        };
    }

    next();
};

const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        const userRole = req.user ? (req.user.roleid || req.user.RoleID) : parseInt(req.headers['x-user-role'] || req.headers['X-User-Role']);

        if (!userRole) {
            return res.status(401).json({ error: "Authentication required." });
        }

        // If single role passed instead of array, wrap it
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (roles.length > 0 && !roles.includes(userRole)) {
            return res.status(403).json({ error: "Access denied: Insufficient permissions." });
        }

        next();
    };
};

module.exports = { protect, authorize };
