import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        console.log("verifyToken middleware running");
        console.log("Headers:", req.headers);
        
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("No authorization header");
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. No token provided." 
            });
        }

        // Get token from header
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log("No token in authorization header");
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. Invalid token format." 
            });
        }

        try {
            // Verify token - check if it's an admin token from the header
            const isAdminRequest = req.headers['x-user-type'] === 'admin';
            console.log("Is admin request:", isAdminRequest);

            // Different secret might be used for admin vs regular users
            const secret = isAdminRequest ? 
                process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET : 
                process.env.JWT_SECRET;
            
            console.log("Using secret key:", secret ? "Secret exists" : "Secret missing");
            
            // Try decoding with the selected secret
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            
            // If this is supposed to be an admin request, verify they have admin role
            if (isAdminRequest && decoded.role !== 'admin') {
                // Fallback - try to decode with regular user secret
                const userDecoded = jwt.verify(token, process.env.JWT_SECRET);
                if (userDecoded.role === 'admin') {
                    req.user = userDecoded;
                    console.log("Token verified as admin with fallback method");
                    next();
                    return;
                }
                
                console.log("Non-admin token used for admin endpoint");
                return res.status(403).json({ 
                    success: false, 
                    message: "Admin access required"
                });
            }
            
            console.log("Token verified successfully:", decoded);
            next();
        } catch (error) {
            // Special handling for admin requests - try validating against both secrets
            if (req.headers['x-user-type'] === 'admin' && req.body.adminToken) {
                try {
                    // Try with the admin secret as fallback
                    const adminDecoded = jwt.verify(
                        req.body.adminToken, 
                        process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
                    );
                    console.log("Admin token verified from request body");
                    req.user = adminDecoded;
                    next();
                    return;
                } catch (innerError) {
                    console.log("Admin token verification from body also failed:", innerError.message);
                }
            }
            
            console.log("Token verification failed:", error.message);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid token."
            });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error in auth middleware."
        });
    }
};

// Specific middleware for admin verification
export const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. No token provided." 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. Invalid token format." 
            });
        }

        // Admin tokens should be verified with the admin secret
        const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
        
        try {
            const decoded = jwt.verify(token, secret);
            
            // Verify this is actually an admin
            if (decoded.role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: "Admin access required"
                });
            }
            
            req.user = decoded;
            next();
        } catch (error) {
            console.log("Admin token verification failed:", error.message);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid admin token."
            });
        }
    } catch (error) {
        console.error("Admin auth middleware error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error in auth middleware."
        });
    }
};

// Add a new middleware that extracts user info when possible but doesn't block requests
export const extractUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Continue without user info
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log("User extracted from token:", decoded);
        } catch (error) {
            // Just log the error but don't block the request
            console.log("Token extraction failed:", error.message);
        }
        
        next();
    } catch (error) {
        console.error("User extraction error:", error);
        next();
    }
};
