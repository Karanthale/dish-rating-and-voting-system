import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

// ==========================================
// ADMIN AUTHORIZATION MIDDLEWARE
// ==========================================
export const authorizeAdmin = (req, res, next) => {
    // Check if the decoded token (req.user) has the role of 'Admin'
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next(); // They are an admin, let them through!
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
};