import express from 'express';
import z from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all products with their reorder points to calculate low stock
    const products = await prisma.product.findMany({
      where: { userId, deletedAt: null },
      select: { quantity: true, reorderPoint: true, price: true },
    });

    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.quantity < p.reorderPoint).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

    const [totalOrders, pendingOrders, totalSuppliers, recentActivities] = await Promise.all([
      prisma.order.count({ where: { userId, deletedAt: null } }),
      prisma.order.count({ where: { userId, status: 'pending', deletedAt: null } }),
      prisma.supplier.count({ where: { userId, deletedAt: null } }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      totalProducts,
      lowStockItems: lowStock,
      totalInventoryValue,
      totalOrders,
      pendingOrders,
      totalSuppliers,
      recentActivities: recentActivities.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Inventory trend (last 30 days)
router.get('/inventory-trend', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        type: { in: ['stock_added', 'stock_updated', 'stock_deleted'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trendMap = new Map<string, number>();
    activities.forEach((a) => {
      const date = a.createdAt.toISOString().split('T')[0] as string;
      trendMap.set(date, (trendMap.get(date) ?? 0) + 1);
    });

    const trend = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      changes: count,
    }));

    res.json(trend);
  } catch (err) {
    next(err);
  }
});

// Sales analytics
router.get('/sales', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;
    const days = parseInt(period as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ['delivered', 'shipped'] },
        orderDate: { gte: startDate },
        deletedAt: null,
      },
      select: {
        totalAmount: true,
        orderDate: true,
      },
    });

    // Group by month
    const salesMap = new Map<string, number>();
    orders.forEach((o) => {
      const month = o.orderDate.toISOString().slice(0, 7);
      salesMap.set(month, (salesMap.get(month) || 0) + o.totalAmount);
    });

    const sales = Array.from(salesMap.entries()).map(([month, total]) => ({
      month,
      total,
    }));

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    res.json({
      sales,
      totalRevenue,
      averageOrderValue,
      orderCount: orders.length,
    });
  } catch (err) {
    next(err);
  }
});

// Top products by quantity ordered
router.get('/top-products', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = '10' } = req.query;
    const topLimit = parseInt(limit as string) || 10;

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map<string, { id: string; name: string; sku: string; quantity: number }>();
    orderItems.forEach((item) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        productMap.set(item.productId, {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        });
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, topLimit);

    res.json(topProducts);
  } catch (err) {
    next(err);
  }
});

export default router;