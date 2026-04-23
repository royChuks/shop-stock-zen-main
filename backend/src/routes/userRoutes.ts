import express from 'express';
import z from 'zod';
import { authenticate } from "../middleware/auth.js";
import {prisma} from "../lib/prisma.js"
import bcrypt from 'bcryptjs';

const router = express.Router();


const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});



/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authenticate, async (req, res) => {
  const user = req.user!;
  // To avoid property access errors, fetch the user data from the database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      businessName: true,
      businessType: true,
    }
  });
  if (!dbUser) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(dbUser);
  });


/**
 * @openapi
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               businessName: { type: string }
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.businessName !== undefined && { businessName: data.businessName }),
        ...(data.businessType !== undefined && { businessType: data.businessType }),
      },
    });
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      businessName: updatedUser.businessName,
      businessType: updatedUser.businessType,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /users/me/password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put('/me/password', authenticate, async (req, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    // Fetch the current user including the passwordHash
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, passwordHash: true }
    });

    if (!user || !(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Incorrect current password' } });
    }

    const newHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;