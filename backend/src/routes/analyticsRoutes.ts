import express from 'express';
import z from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [totalProducts, lowStock, totalOrders, pendingOrders, totalSuppliers] = await Promise.all([
      prisma.product.count({ where: { userId, deletedAt: null } }),
      prisma.product.count({ where: { userId, deletedAt: null, quantity: { lt: prisma.product.fields.reorderPoint } } }),
      prisma.order.count({ where: { userId, deletedAt: null } }),
      prisma.order.count({ where: { userId, status: 'pending', deletedAt: null } }),
      prisma.supplier.count({ where: { userId, deletedAt: null } }),
    ]);

    res.json({
      totalProducts,
      lowStockItems: lowStock,
      totalOrders,
      pendingOrders,
      totalSuppliers,
      // Add more stats as needed
    });
  } catch (err) {
    next(err);
  }
});

export default router;