import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import z from 'zod';
import { prisma } from "../lib/prisma.js";
// import { PrismaClient } from "../../generated/prisma/index.js";
const router = express.Router();
// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    businessName: z.string().optional(),
    businessType: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               businessName: { type: string }
 *               businessType: { type: string }
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'Email already in use' } });
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                businessName: data.businessName ?? null,
                businessType: data.businessType ?? null,
            },
        });
        const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, businessName: user.businessName, businessType: user.businessType }, token, expiresIn: 86400 });
    }
    catch (err) {
        next(err);
    }
});
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: data.email, deletedAt: null } });
        if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
            return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        }
        const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, businessName: user.businessName, businessType: user.businessType }, token, expiresIn: 86400 });
    }
    catch (err) {
        next(err);
    }
});
// TODO: Add /refresh, /logout, /forgot-password (Phase 2 for forgot-password with email)
export default router;
//# sourceMappingURL=authRoutes.js.map