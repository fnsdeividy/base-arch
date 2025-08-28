import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default roles
  console.log('Creating default roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrator with full access',
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with basic access',
      isSystem: true,
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator with elevated permissions',
      isSystem: false,
    },
  });

  console.log('✅ Roles created:', { adminRole, userRole, moderatorRole });

  // Create default permissions
  console.log('Creating default permissions...');
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: {
        name: 'users.read',
        description: 'Read user information',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: {
        name: 'users.create',
        description: 'Create new users',
        resource: 'users',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: {
        name: 'users.update',
        description: 'Update user information',
        resource: 'users',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.read' },
      update: {},
      create: {
        name: 'roles.read',
        description: 'Read role information',
        resource: 'roles',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.create' },
      update: {},
      create: {
        name: 'roles.create',
        description: 'Create new roles',
        resource: 'roles',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.update' },
      update: {},
      create: {
        name: 'roles.update',
        description: 'Update role information',
        resource: 'roles',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.delete' },
      update: {},
      create: {
        name: 'roles.delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.read' },
      update: {},
      create: {
        name: 'permissions.read',
        description: 'Read permission information',
        resource: 'permissions',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.assign' },
      update: {},
      create: {
        name: 'permissions.assign',
        description: 'Assign permissions to roles',
        resource: 'permissions',
        action: 'assign',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'audit.read' },
      update: {},
      create: {
        name: 'audit.read',
        description: 'Read audit logs',
        resource: 'audit',
        action: 'read',
      },
    }),
  ]);

  console.log('✅ Permissions created:', permissions.length);

  // Assign all permissions to admin role
  console.log('Assigning permissions to admin role...');
  const adminRolePermissions = await Promise.all(
    permissions.map(permission =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  console.log('✅ Admin role permissions assigned:', adminRolePermissions.length);

  // Assign basic permissions to user role
  console.log('Assigning basic permissions to user role...');
  const userPermissions = permissions.filter(
    p => p.name === 'users.read' || p.name === 'audit.read'
  );

  const userRolePermissions = await Promise.all(
    userPermissions.map(permission =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  console.log('✅ User role permissions assigned:', userRolePermissions.length);

  // Create default admin user
  console.log('Creating default admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cloro.com' },
    update: {},
    create: {
      email: 'admin@cloro.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+5511999999999',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Assign admin role to admin user
  console.log('Assigning admin role to admin user...');
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin role assigned to admin user');

  // Create some sample users
  console.log('Creating sample users...');
  const sampleUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@cloro.com' },
      update: {},
      create: {
        email: 'user1@cloro.com',
        password: await bcrypt.hash('user123', 10),
        firstName: 'John',
        lastName: 'Doe',
        phone: '+5511888888888',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@cloro.com' },
      update: {},
      create: {
        email: 'user2@cloro.com',
        password: await bcrypt.hash('user123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+5511777777777',
        isActive: true,
        emailVerified: true,
      },
    }),
  ]);

  console.log('✅ Sample users created:', sampleUsers.length);

  // Assign user role to sample users
  console.log('Assigning user role to sample users...');
  await Promise.all(
    sampleUsers.map(user =>
      prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: userRole.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: userRole.id,
        },
      })
    )
  );

  console.log('✅ User roles assigned to sample users');

  // Create some sample audit logs
  console.log('Creating sample audit logs...');
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'user.login',
        resourceType: 'auth',
        resourceId: adminUser.id,
        details: { ip: '127.0.0.1', userAgent: 'Prisma Seed Script' },
        ipAddress: '127.0.0.1',
        userAgent: 'Prisma Seed Script',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'database.seed',
        resourceType: 'system',
        resourceId: 'seed-script',
        details: { message: 'Database seeded successfully' },
        ipAddress: '127.0.0.1',
        userAgent: 'Prisma Seed Script',
      },
    }),
  ]);

  console.log('✅ Sample audit logs created:', auditLogs.length);

  // Create sample stores
  console.log('Creating sample stores...');
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'Loja Principal',
        description: 'Loja principal da empresa',
        address: 'Rua das Flores, 123 - Centro',
        phone: '+5511111111111',
        email: 'loja@cloro.com',
        isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Loja Shopping',
        description: 'Loja localizada no shopping',
        address: 'Shopping Center, Loja 45 - 2º Piso',
        phone: '+5511222222222',
        email: 'shopping@cloro.com',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Sample stores created:', stores.length);

  // Create sample products
  console.log('Creating sample products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone Galaxy S23',
        description: 'Smartphone Samsung Galaxy S23 128GB',
        sku: 'PROD001',
        price: 2999.99,
        cost: 2500.00,
        category: 'Eletrônicos',
        brand: 'Samsung',
        weight: 0.168,
        dimensions: '146.3 x 70.9 x 7.6 mm',
        isActive: true,
        storeId: stores[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Notebook Dell Inspiron',
        description: 'Notebook Dell Inspiron 15" Intel i5',
        sku: 'PROD002',
        price: 3999.99,
        cost: 3200.00,
        category: 'Eletrônicos',
        brand: 'Dell',
        weight: 2.1,
        dimensions: '358.5 x 235 x 19.9 mm',
        isActive: true,
        storeId: stores[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fone de Ouvido Bluetooth',
        description: 'Fone de ouvido sem fio com cancelamento de ruído',
        sku: 'PROD003',
        price: 299.99,
        cost: 180.00,
        category: 'Acessórios',
        brand: 'Sony',
        weight: 0.250,
        dimensions: '7.2 x 5.4 x 3.2 cm',
        isActive: true,
        storeId: stores[1].id,
      },
    }),
  ]);

  console.log('✅ Sample products created:', products.length);

  // Create sample customers
  console.log('Creating sample customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
        phone: '+5511333333333',
        address: 'Rua das Palmeiras, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@email.com',
        phone: '+5511444444444',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        country: 'Brasil',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Sample customers created:', customers.length);

  // Create sample stocks
  console.log('Creating sample stocks...');
  const stocks = await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[0].id,
        storeId: stores[0].id,
        quantity: 50,
        minQuantity: 10,
        maxQuantity: 100,
        location: 'Prateleira A1',
        status: 'active',
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[1].id,
        storeId: stores[0].id,
        quantity: 25,
        minQuantity: 5,
        maxQuantity: 50,
        location: 'Prateleira B2',
        status: 'active',
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[2].id,
        storeId: stores[1].id,
        quantity: 100,
        minQuantity: 20,
        maxQuantity: 200,
        location: 'Prateleira C3',
        status: 'active',
      },
    }),
  ]);

  console.log('✅ Sample stocks created:', stocks.length);

  // Create sample orders
  console.log('Creating sample orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD001',
        customerId: customers[0].id,
        storeId: stores[0].id,
        status: 'completed',
        totalAmount: 2999.99,
        discount: 100.00,
        taxAmount: 150.00,
        notes: 'Cliente preferiu pagamento à vista',
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD002',
        customerId: customers[1].id,
        storeId: stores[1].id,
        status: 'pending',
        totalAmount: 299.99,
        discount: 0,
        taxAmount: 15.00,
        notes: 'Entrega agendada para próxima semana',
      },
    }),
  ]);

  console.log('✅ Sample orders created:', orders.length);

  // Create sample order items
  console.log('Creating sample order items...');
  const orderItems = await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        unitPrice: 2999.99,
        discount: 100.00,
        total: 2899.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[2].id,
        quantity: 1,
        unitPrice: 299.99,
        discount: 0,
        total: 299.99,
      },
    }),
  ]);

  console.log('✅ Sample order items created:', orderItems.length);

  // Create sample invoices
  console.log('Creating sample invoices...');
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV001',
        orderId: orders[0].id,
        customerId: customers[0].id,
        status: 'paid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalAmount: 3049.99,
        taxAmount: 150.00,
        notes: 'Fatura paga no ato da compra',
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV002',
        orderId: orders[1].id,
        customerId: customers[1].id,
        status: 'pending',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        totalAmount: 314.99,
        taxAmount: 15.00,
        notes: 'Aguardando pagamento',
      },
    }),
  ]);

  console.log('✅ Sample invoices created:', invoices.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Roles: ${[adminRole, userRole, moderatorRole].length}`);
  console.log(`- Permissions: ${permissions.length}`);
  console.log(`- Users: ${[adminUser, ...sampleUsers].length}`);
  console.log(`- Audit Logs: ${auditLogs.length}`);
  console.log(`- Stores: ${stores.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Customers: ${customers.length}`);
  console.log(`- Stocks: ${stocks.length}`);
  console.log(`- Orders: ${orders.length}`);
  console.log(`- Order Items: ${orderItems.length}`);
  console.log(`- Invoices: ${invoices.length}`);
  console.log('\n🔑 Default credentials:');
  console.log('Admin: admin@cloro.com / admin123');
  console.log('User: user1@cloro.com / user123');
  console.log('User: user2@cloro.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
