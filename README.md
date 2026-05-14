# Shop Stock Zen

A full-stack inventory management application designed for small businesses to track products, manage suppliers, process orders, and analyze business performance.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Shop Stock Zen is a modern inventory management system that helps small businesses track their stock levels, manage suppliers, process purchase orders, and gain insights through analytics and reports. Built with a clean, responsive interface using React and shadcn/ui, backed by a robust Express.js API with PostgreSQL.

## Features

- **Dashboard** - Real-time overview of inventory health, recent activities, and key metrics
- **Inventory Management** - Track products with SKU, quantity, reorder points, pricing, and categories
- **Order Management** - Create and track purchase orders from suppliers
- **Supplier Management** - Manage supplier contacts, ratings, and order history
- **Analytics** - Visual charts and insights on stock levels, sales trends, and business performance
- **Reports** - Generate detailed reports on inventory, orders, and financial data
- **Alerts & Notifications** - Automatic alerts for low stock and critical inventory levels
- **Activity Tracking** - Log all business activities for audit and reference

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | Component Library |
| React Router | Navigation |
| Recharts | Data Visualization |
| React Query | Data Fetching |

### Backend

| Technology | Purpose |
|------------|---------|
| Express.js | API Framework |
| TypeScript | Type Safety |
| PostgreSQL | Database |
| Prisma ORM | Database ORM |
| JWT | Authentication |
| Swagger/OpenAPI | API Documentation |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shop-stock-zen.git
cd shop-stock-zen
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE shopstockzen;
```

2. Update the `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopstockzen?schema=public"
```

3. Run migrations:
```bash
cd backend
npm run prisma:migrate
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopstockzen?schema=public"
JWT_SECRET="your-super-secret-key-change-in-production"
PORT=3000
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

### 5. Run the Application

**Start Backend:**
```bash
cd backend
npm run dev
```
The API runs at `http://localhost:3000` with Swagger docs at `http://localhost:3000/api-docs`

**Start Frontend:**
```bash
cd frontend
npm run dev
```
The frontend runs at `http://localhost:5173`

## Project Structure

```
shop-stock-zen/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts (auth, etc.)
│   │   ├── types/           # TypeScript type definitions
│   │   └── lib/             # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── lib/             # Utilities and helpers
│   │   ├── index.ts         # Application entry point
│   │   └── app.ts           # Express app configuration
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List all products |
| POST | `/api/v1/products` | Create product |
| GET | `/api/v1/products/:id` | Get product by ID |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | List all orders |
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders/:id` | Get order by ID |
| PUT | `/api/v1/orders/:id` | Update order |
| DELETE | `/api/v1/orders/:id` | Delete order |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/suppliers` | List all suppliers |
| POST | `/api/v1/suppliers` | Create supplier |
| GET | `/api/v1/suppliers/:id` | Get supplier by ID |
| PUT | `/api/v1/suppliers/:id` | Update supplier |
| DELETE | `/api/v1/suppliers/:id` | Delete supplier |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | Dashboard metrics |
| GET | `/api/v1/analytics/inventory` | Inventory analytics |
| GET | `/api/v1/analytics/orders` | Order analytics |
| GET | `/api/v1/analytics/suppliers` | Supplier analytics |

## Scripts

### Backend
```bash
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with sample data
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure tests pass and code is properly formatted before submitting.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.