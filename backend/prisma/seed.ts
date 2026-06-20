import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a demo user
  const passwordHash = await bcrypt.hash("demo123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@shopstockzen.com" },
    update: {},
    create: {
      email: "demo@shopstockzen.com",
      passwordHash,
      firstName: "Demo",
      lastName: "User",
      businessName: "ShopStockZen Demo",
      businessType: "retail",
    },
  });

  console.log(`Created user: ${user.email} (ID: ${user.id})`);

  // Create a supplier
  const supplier = await prisma.supplier.create({
    data: {
      userId: user.id,
      name: "Acme Wholesale Co.",
      email: "orders@acmewholesale.com",
      phone: "+1-555-0100",
      address: "123 Supply Chain Blvd, Commerce City, CO 80022",
      contactPerson: "Jane Doe",
      category: "general",
      rating: 4,
      status: "active",
    },
  });

  console.log(`Created supplier: ${supplier.name}`);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        userId: user.id,
        supplierId: supplier.id,
        name: "Widget Alpha",
        sku: "WGT-001",
        category: "Components",
        description: "High-quality aluminum widget",
        quantity: 150,
        reorderPoint: 25,
        price: 12.99,
        cost: 7.50,
        status: "healthy",
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        supplierId: supplier.id,
        name: "Gadget Beta",
        sku: "GDT-002",
        category: "Electronics",
        description: "Portable electronic gadget",
        quantity: 8,
        reorderPoint: 20,
        price: 49.99,
        cost: 32.00,
        status: "low",
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        supplierId: supplier.id,
        name: "Component Gamma",
        sku: "CMP-003",
        category: "Components",
        quantity: 0,
        reorderPoint: 15,
        price: 3.49,
        cost: 1.80,
        status: "critical",
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      supplierId: supplier.id,
      orderNumber: `ORD-${Date.now()}`,
      status: "pending",
      totalAmount: products.reduce((sum, p) => sum + p.cost * 10, 0),
      orderDate: new Date(),
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "Initial stock order",
      orderItems: {
        create: products.map((p) => ({
          productId: p.id,
          quantity: 10,
          unitPrice: p.cost,
        })),
      },
    },
  });

  console.log(`Created order: ${order.orderNumber}`);

  // Create sample alerts
  await prisma.alert.createMany({
    data: [
      {
        userId: user.id,
        type: "low_stock",
        title: "Low Stock Alert",
        description: "Gadget Beta is running low (8 remaining)",
        productId: products[1]!.id,
      },
      {
        userId: user.id,
        type: "critical_stock",
        title: "Critical Stock Alert",
        description: "Component Gamma is out of stock",
        productId: products[2]!.id,
      },
    ],
  });

  console.log("Created alerts");

  // Log the activity
  await prisma.activity.create({
    data: {
      userId: user.id,
      type: "system",
      title: "Database Seeded",
      description: "Initial seed data was loaded into the database",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("   Demo login: demo@shopstockzen.com / demo123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
