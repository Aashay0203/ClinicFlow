// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    let token;

    // Token format: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    //console.log(token);
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user to request
        req.user = { id: decoded.userId, role: decoded.role, email: decoded.email };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
export default protect; 
