import express from 'express';
import z from 'zod';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

const createOrderSchema = z.object({
  supplierId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),   
  })),
  orderDate: z.string().datetime().optional(),
  expectedDelivery: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Full CRUD for orders (list, create, get one, update status, cancel) can be added here.
// Let me know if you want the full file now.

export default router;