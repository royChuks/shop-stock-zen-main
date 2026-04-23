import express from 'express';
import z, { includes } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';


const router = express.Router();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(0),
  reorderPoint: z.number().int().min(0),
  price: z.number().positive(),
  cost: z.number().positive(),
  supplierId: z.string().uuid().optional(),
});

const updateProductSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().optional(),
  reorderPoint: z.number().int().optional(),
  price: z.number().optional(),
  cost: z.number().optional(),
  supplierId: z.string().uuid().optional(),
});

const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int(),
    type: z.enum(['set', 'add', 'subtract']),
  })),
});

// Helper to calculate status
const getStatus = (quantity: number, reorderPoint: number) => {
  if (quantity <= 0) return 'critical';
  if (quantity < reorderPoint) return 'low';
  return 'healthy';
};

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 20 }
 *       - name: category
 *         in: query
 *         schema: { type: string }
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [healthy, low, critical] }
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
 *         description: List of products
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { userId: req.user!.id, deletedAt: null };
    if (category) where.category = category as string;
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy as string]: sortOrder };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: { supplier: { select: { name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products.map((p) => ({
        ...p,
        supplier: p.supplier?.name,
        lastUpdated: p.lastUpdated.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /products/{productId}:
 *   get:
 *     tags: [Products]
 *     summary: Get single product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:productId', authenticate, async (req, res, next) => {
  try {
    // // in Get /:productId
    // const productWithSupplier = Prisma.validator<Prisma.ProductDefaultArgs>()({
    //   include:{supplier:{select:{name: true}}},
    // })
    // type ProductWithSupplier = Prisma.ProductGetPayload<typeof productWithSupplier>;

    const productId = req.params.productId as string
    const product = await prisma.product.findUnique({
      where: { id: productId, userId: req.user!.id, deletedAt: null },
      include: { supplier: { select: { name: true } } },
    }); // cast or use if (!product) check
    if (!product) {
      return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
    }
    res.json({
      ...product,
      supplier: product.supplier?.name,
      lastUpdated: product.lastUpdated.toISOString(),
      createdAt: product.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               sku: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               quantity: { type: integer }
 *               reorderPoint: { type: integer }
 *               price: { type: number }
 *               cost: { type: number }
 *               supplierId: { type: string }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = createProductSchema.parse(req.body);
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return res.status(409).json({ error: { code: 'SKU_DUPLICATE', message: 'SKU already exists' } });
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId, userId: req.user!.id } });
      if (!supplier) {
        return res.status(404).json({ error: { code: 'SUPPLIER_NOT_FOUND', message: 'Supplier not found' } });
      }
    }

    const product = await prisma.product.create({
      data: {

        userId:req.user!.id,
        status:getStatus(data.quantity, data.reorderPoint),
        name: data.name,
        sku: data.sku,
        category: data.category ,
        description: data.description ?? null,
        quantity : data.quantity,
        reorderPoint:data.reorderPoint,
        price: data.price,
        cost:data.cost,
        supplierId: data.supplierId ?? null,
        // ...data,
        // userId: req.user!.id,
        // status: getStatus(data.quantity, data.reorderPoint),
      },
    });

    res.status(201).json({
      ...product,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /products/{productId}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
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
 *               quantity: { type: integer }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put('/:productId', authenticate, async (req, res, next) => {
  try {
    const productId = req.params.productId as string;

    const input = updateProductSchema.parse(req.body);

    // Fetch current product
    const currentProduct = await prisma.product.findUnique({
      where: {
        id: productId,
        userId: req.user!.id,
        deletedAt: null,
      },
      include: {
        supplier: { select: { name: true } },
      },
    });

    if (!currentProduct) {
      return res.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
      });
    }

    // Validate new supplier if provided
    if (input.supplierId !== undefined) {
      if (input.supplierId === null) {
        // explicitly allowed to remove supplier
      } else {
        const supplierExists = await prisma.supplier.findUnique({
          where: { id: input.supplierId, userId: req.user!.id },
        });
        if (!supplierExists) {
          return res.status(404).json({
            error: { code: 'SUPPLIER_NOT_FOUND', message: 'Supplier not found' },
          });
        }
      }
    }

    // Build update object — only include fields that were actually sent
    const updateData: any = {
      lastUpdated: new Date(),
    };

    if (input.name !== undefined)        updateData.name = input.name;
    if (input.category !== undefined)    updateData.category = input.category;
    if (input.description !== undefined) updateData.description = input.description ?? null;
    if (input.quantity !== undefined)    updateData.quantity = input.quantity;
    if (input.reorderPoint !== undefined) updateData.reorderPoint = input.reorderPoint;
    if (input.price !== undefined)       updateData.price = input.price;
    if (input.cost !== undefined)        updateData.cost = input.cost;
    if (input.supplierId !== undefined)  updateData.supplierId = input.supplierId;

    // Always recalculate status if quantity or reorderPoint changed
    const newQuantity = input.quantity !== undefined ? input.quantity : currentProduct.quantity;
    const newReorderPoint =
      input.reorderPoint !== undefined ? input.reorderPoint : currentProduct.reorderPoint;

    updateData.status = getStatus(newQuantity, newReorderPoint);

    // Perform update — include relation so we get fresh supplier name
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        supplier: { select: { name: true } },
      },
    });

    // Format dates and response
    res.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      category: updatedProduct.category,
      description: updatedProduct.description,
      quantity: updatedProduct.quantity,
      reorderPoint: updatedProduct.reorderPoint,
      price: updatedProduct.price,
      cost: updatedProduct.cost,
      status: updatedProduct.status,
      supplier: updatedProduct.supplier?.name ?? null,
      supplierId: updatedProduct.supplierId,
      lastUpdated: updatedProduct.lastUpdated.toISOString(),
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
/**
 * @openapi
 * /products/{productId}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (soft)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    const productId = req.params.productId as string
    const product = await prisma.product.findUnique({
      where: { id: productId, userId: req.user!.id, deletedAt: null },
    });
    if (!product) {
      return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /products/bulk/quantities:
 *   put:
 *     tags: [Products]
 *     summary: Bulk update quantities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer }
 *                     type: { type: string, enum: [set, add, subtract] }
 *     responses:
 *       200:
 *         description: Bulk update result
 */
router.put('/bulk/quantities', authenticate, async (req, res, next) => {
  try {
    const { updates } = bulkUpdateSchema.parse(req.body);
    let updated = 0;
    let failed = 0;

    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        const product = await tx.product.findUnique({
          where: { id: update.productId, userId: req.user!.id, deletedAt: null },
        });
        if (!product) {
          failed++;
          continue;
        }

        let newQuantity: number;
        switch (update.type) {
          case 'set':
            newQuantity = update.quantity;
            break;
          case 'add':
            newQuantity = product.quantity + update.quantity;
            break;
          case 'subtract':
            newQuantity = product.quantity - update.quantity;
            if (newQuantity < 0) newQuantity = 0;  // Prevent negative
            break;
        }

        await tx.product.update({
          where: { id: update.productId },
          data: {
            quantity: newQuantity,
            status: getStatus(newQuantity, product.reorderPoint),
            lastUpdated: new Date(),
          },
        });
        updated++;
      }
    });

    res.json({ updated, failed });
  } catch (err) {
    next(err);
  }
});

export default router;