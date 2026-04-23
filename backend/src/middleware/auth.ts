import jwt from 'jsonwebtoken';
import express from "express";
import {prisma} from "../lib/prisma.js"


declare global{
  namespace Express{
    interface Request{
      user?:{
        id: string;
        role?: string;
      }
    }
  }
}
export const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: { code: 'AUTH_UNAUTHORIZED', message: 'Missing token' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub, deletedAt: null },  // Soft delete check
    });
    if (!user) {
      return res.status(401).json({ error: { code: 'AUTH_UNAUTHORIZED', message: 'Invalid token' } });
    }
    req.user = user;  // Attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Token expired or invalid' } });
  }
};