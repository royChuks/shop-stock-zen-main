import express from 'express';
import z from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  category: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ====================== LIST SUPPLIERS ======================
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id, deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' } }),
      prisma.supplier.count({ where }),
    ]);

    res.json({
      data: suppliers,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// ====================== CREATE SUPPLIER ======================
router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = supplierSchema.parse(req.body);
    const supplier = await prisma.supplier.create({
      data: { ...data, userId: req.user!.id },
    });
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
});

// Add GET /:id, PUT /:id, DELETE /:id similarly (I can give you the full file if you want all CRUD at once)

export default router;