// src/index.ts
import 'dotenv/config';
import express from 'express';
import  type {Express, Request,Response, NextFunction} from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import {prisma} from "../src/lib/prisma.js"


import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
// Import more routes as you create them:


const app : Express = express();


// configuration 
const PORT = Number(process.env.PORT) || 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN ||   'http://localhost:5173';


// middleware

app.use(cors({
    origin:CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// SWAGGER / API DOCUMENTATION
// ================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shop Stock Zen API',
      version: '1.0.0',
      description: 'Inventory Management System Backend API',
      contact: {
        name: 'David',
        // email: 'your-email@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      // Add production server later
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Scans all route files for JSDoc comments
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Shop Stock Zen API',
}));

// ================================
// ROUTES
// ================================
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Catch-all for undefined routes
app.use('/', (_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      statusCode: 404,
    },
  });
});

// ================================
// GLOBAL ERROR HANDLER
// ================================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      statusCode,
      timestamp: new Date().toISOString(),
      // requestId: req.id,  // if you add request-id middleware later
    },
  };

  // In production, don't leak stack traces
  if (process.env.NODE_ENV === 'production') {
    delete (errorResponse.error as any).stack;
  }

  res.status(statusCode).json(errorResponse);
});

// ================================
// START SERVER & GRACEFUL SHUTDOWN
// ================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Shop Stock Zen API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connections closed.');
    process.exit(0);
  });

  // Force exit after 10 seconds if shutdown hangs
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Optional: Log unhandled rejections/exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});