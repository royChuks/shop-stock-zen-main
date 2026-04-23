import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import  swaggerUi from 'swagger-ui-express';
import {prisma} from "./lib/prisma.js"
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
// add more routes later : orderRoutes ,supplierRoutes e.t.c


dotenv.config();


const app = express();
const port = process.env.PORT || 3000


app.use('/',cors({origin:process.env.CORS_ORIGIN}));
app.use(express.json());

// swagger setup forn spec 
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Shop Stock Zen API',
        version: '1.0.0',
        description: 'Inventory Management System API',
      },
      servers: [{ url: `http://localhost:${port}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
    apis: ['./src/routes/*.ts'],
  };
  const swaggerSpecs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  
  // Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/suppliers', supplierRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  // TODO: Add /orders, /suppliers, /analytics, etc.
  
  // Error handling middleware (basic, expand later)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message,
        statusCode,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,  // Add middleware for requestId if needed
      },
    });
  });
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api-docs`);
  });