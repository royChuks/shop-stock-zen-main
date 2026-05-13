import express from 'express';
import z from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Validation schemas
const createOrderSchema = z.object({
  supplierId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  orderDate: z.string().datetime().optional(),
  expectedDelivery: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  expectedDelivery: z.string().datetime().optional(),
  actualDelivery: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Helper to generate order number (using timestamp + random for uniqueness)
const generateOrderNumber = (): string => {
  const prefix = 'ORD';
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).slice(-4);
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${year}-${timestamp}${random}`.toUpperCase();
};

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List all orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 20 }
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *       - name: supplierId
 *         in: query
 *         schema: { type: string }
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, default: createdAt }
 *       - name: sortOrder
 *         in: query
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, supplierId, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id, deletedAt: null };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy as string]: sortOrder };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          supplier: { select: { id: true, name: true } },
          orderItems: { select: { id: true, productId: true, quantity: true, unitPrice: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders.map((o) => ({
        ...o,
        orderDate: o.orderDate.toISOString(),
        expectedDelivery: o.expectedDelivery?.toISOString() ?? null,
        actualDelivery: o.actualDelivery?.toISOString() ?? null,
        createdAt: o.createdAt.toISOString(),
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get single order with items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details with items
 */
router.get('/:orderId', authenticate, async (req, res, next) => {
  try {
    const orderId = req.params.orderId as string;

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: req.user!.id, deletedAt: null },
      include: {
        supplier: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
    }

    res.json({
      ...order,
      orderDate: order.orderDate.toISOString(),
      expectedDelivery: order.expectedDelivery?.toISOString() ?? null,
      actualDelivery: order.actualDelivery?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierId: { type: string }
 *               items: { type: array }
 *               orderDate: { type: string }
 *               expectedDelivery: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Verify supplier exists and belongs to user
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId, userId: req.user!.id, deletedAt: null },
    });
    if (!supplier) {
      return res.status(404).json({ error: { code: 'SUPPLIER_NOT_FOUND', message: 'Supplier not found' } });
    }

    // Verify all products exist and belong to user (batch query to avoid N+1)
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, userId: req.user!.id, deletedAt: null },
      select: { id: true },
    });
    const foundProductIds = new Set(products.map(p => p.id));
    for (const item of data.items) {
      if (!foundProductIds.has(item.productId)) {
        return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: `Product ${item.productId} not found` } });
      }
    }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // Generate order number
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        orderNumber,
        supplierId: data.supplierId,
        totalAmount,
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
        notes: data.notes ?? null,
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        orderItems: true,
      },
    });

    // Update supplier's total orders and last order date
    await prisma.supplier.update({
      where: { id: data.supplierId },
      data: {
        totalOrders: { increment: 1 },
        lastOrderDate: new Date(),
      },
    });

    res.status(201).json({
      ...order,
      orderDate: order.orderDate.toISOString(),
      expectedDelivery: order.expectedDelivery?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders/{orderId}:
 *   put:
 *     tags: [Orders]
 *     summary: Update order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
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
 *               status: { type: string }
 *               expectedDelivery: { type: string }
 *               actualDelivery: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Order updated
 */
router.put('/:orderId', authenticate, async (req, res, next) => {
  try {
    const orderId = req.params.orderId as string;

    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId, userId: req.user!.id, deletedAt: null },
    });
    if (!existingOrder) {
      return res.status(404).json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
    }

    // Cannot update a cancelled order
    if (existingOrder.status === 'cancelled') {
      return res.status(400).json({ error: { code: 'ORDER_CANCELLED', message: 'Cannot update a cancelled order' } });
    }

    const input = updateOrderSchema.parse(req.body);

    const updateData: any = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.expectedDelivery !== undefined) updateData.expectedDelivery = new Date(input.expectedDelivery);
    if (input.actualDelivery !== undefined) updateData.actualDelivery = new Date(input.actualDelivery);
    if (input.notes !== undefined) updateData.notes = input.notes;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    res.json({
      ...order,
      orderDate: order.orderDate.toISOString(),
      expectedDelivery: order.expectedDelivery?.toISOString() ?? null,
      actualDelivery: order.actualDelivery?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders/{orderId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Soft delete order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order deleted
 */
router.delete('/:orderId', authenticate, async (req, res, next) => {
  try {
    const orderId = req.params.orderId as string;

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: req.user!.id, deletedAt: null },
    });
    if (!order) {
      return res.status(404).json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders/{orderId}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
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
 *               status: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch('/:orderId/status', authenticate, async (req, res, next) => {
  try {
    const orderId = req.params.orderId as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: { code: 'MISSING_STATUS', message: 'Status is required' } });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId, userId: req.user!.id, deletedAt: null },
    });
    if (!existingOrder) {
      return res.status(404).json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        supplier: { select: { id: true, name: true } },
        orderItems: true,
      },
    });

    res.json({
      ...order,
      orderDate: order.orderDate.toISOString(),
      expectedDelivery: order.expectedDelivery?.toISOString() ?? null,
      actualDelivery: order.actualDelivery?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;