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

/**
 * @openapi
 * /suppliers/{supplierId}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get single supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: supplierId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Supplier details
 */
router.get('/:supplierId', authenticate, async (req, res, next) => {
  try {
    const supplierId = req.params.supplierId as string;
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId, userId: req.user!.id, deletedAt: null },
    });
    if (!supplier) {
      return res.status(404).json({ error: { code: 'SUPPLIER_NOT_FOUND', message: 'Supplier not found' } });
    }
    res.json({
      ...supplier,
      lastOrderDate: supplier.lastOrderDate?.toISOString() ?? null,
      createdAt: supplier.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /suppliers/{supplierId}:
 *   put:
 *     tags: [Suppliers]
 *     summary: Update supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: supplierId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               contactPerson: { type: string }
 *               category: { type: string }
 *               rating: { type: integer }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Supplier updated
 */
router.put('/:supplierId', authenticate, async (req, res, next) => {
  try {
    const supplierId = req.params.supplierId as string;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId, userId: req.user!.id, deletedAt: null },
    });
    if (!existingSupplier) {
      return res.status(404).json({ error: { code: 'SUPPLIER_NOT_FOUND', message: 'Supplier not found' } });
    }

    const input = supplierSchema.partial().parse(req.body);

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: input,
    });

    res.json({
      ...supplier,
      lastOrderDate: supplier.lastOrderDate?.toISOString() ?? null,
      createdAt: supplier.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /suppliers/{supplierId}:
 *   delete:
 *     tags: [Suppliers]
 *     summary: Soft delete supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: supplierId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Supplier deleted
 */
router.delete('/:supplierId', authenticate, async (req, res, next) => {
  try {
    const supplierId = req.params.supplierId as string;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId, userId: req.user!.id, deletedAt: null },
    });
    if (!supplier) {
      return res.status(404).json({ error: { code: 'SUPPLIER_NOT_FOUND', message: 'Supplier not found' } });
    }

    // Check for active orders
    const activeOrders = await prisma.order.count({
      where: { supplierId, userId: req.user!.id, status: { in: ['pending', 'confirmed', 'shipped'] }, deletedAt: null },
    });
    if (activeOrders > 0) {
      return res.status(400).json({ error: { code: 'SUPPLIER_HAS_ORDERS', message: 'Cannot delete supplier with active orders' } });
    }

    await prisma.supplier.update({
      where: { id: supplierId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;