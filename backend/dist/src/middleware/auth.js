import jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma.js";
export const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: { code: 'AUTH_UNAUTHORIZED', message: 'Missing token' } });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub, deletedAt: null }, // Soft delete check
        });
        if (!user) {
            return res.status(401).json({ error: { code: 'AUTH_UNAUTHORIZED', message: 'Invalid token' } });
        }
        req.user = user; // Attach user to request
        next();
    }
    catch (err) {
        return res.status(401).json({ error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Token expired or invalid' } });
    }
};
//# sourceMappingURL=auth.js.map