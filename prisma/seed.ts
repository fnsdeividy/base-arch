import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
    },
  });

  // Criar role admin
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role',
      isSystem: true,
    },
  });

  // Associar usuário ao role admin
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

  // Criar usuário de teste
  const testPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
    },
  });

  // Criar role user
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user role',
      isSystem: true,
    },
  });

  // Associar usuário de teste ao role user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });

  // Criar role cashier
  const cashierRole = await prisma.role.upsert({
    where: { name: 'cashier' },
    update: {},
    create: {
      name: 'cashier',
      description: 'Cashier user role',
      isSystem: true,
    },
  });

  // Criar usuário caixa
  const cashierPassword = await bcrypt.hash('caixa123', 10);
  const cashierUser = await prisma.user.upsert({
    where: { email: 'caixa@example.com' },
    update: {},
    create: {
      email: 'caixa@example.com',
      password: cashierPassword,
      firstName: 'Operador',
      lastName: 'Caixa',
      isActive: true,
      emailVerified: true,
    },
  });

  // Associar usuário caixa ao role cashier
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: cashierUser.id,
        roleId: cashierRole.id,
      },
    },
    update: {},
    create: {
      userId: cashierUser.id,
      roleId: cashierRole.id,
    },
  });

  // Criar loja principal
  const mainStore = await prisma.store.upsert({
    where: { id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' },
    update: {},
    create: {
      id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Loja Principal',
      description: 'Loja principal do sistema Cloro',
      address: 'Rua Principal, 123, Centro - São Paulo, SP',
      phone: '+55 11 3333-3333',
      email: 'principal@cloro.com',
      isActive: true,
    },
  });

  // Criar customer padrão
  const defaultCustomer = await prisma.customer.upsert({
    where: { id: '4F461257-2F49-4667-83E4-A9510DDAE575' },
    update: {},
    create: {
      id: '4F461257-2F49-4667-83E4-A9510DDAE575',
      firstName: 'Cliente',
      lastName: 'Padrão',
      email: 'cliente.padrao@cloro.com',
      phone: '+55 11 99999-9999',
      address: 'Endereço padrão',
      city: 'São Paulo',
      state: 'SP',
      isActive: true,
    },
  });

  // Criar produtos de exemplo
  const products = [
    {
      id: 'B96D1208-BF58-4A45-8307-24005C8C46C8',
      name: 'Notebook Dell Inspiron 15',
      description: 'Notebook Dell Inspiron 15 com processador Intel Core i5, 8GB RAM, 256GB SSD',
      price: 2499.99,
      sku: 'NB-DELL-001',
      category: 'Notebooks',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: '0A915B12-C5CD-4978-BF09-2C7D275B082C',
      name: 'Mouse Logitech MX Master 3',
      description: 'Mouse sem fio Logitech MX Master 3 com sensor de alta precisão',
      price: 399.99,
      sku: 'MS-LOG-001',
      category: 'Periféricos',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: '4226C6AC-38CF-41A0-B9D8-4A13906333EF',
      name: 'Teclado Mecânico Keychron K2',
      description: 'Teclado mecânico sem fio Keychron K2 com switches Brown',
      price: 599.99,
      sku: 'KB-KEY-001',
      category: 'Periféricos',
      storeId: mainStore.id,
      isActive: true,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { id: productData.id },
      update: {},
      create: productData,
    });
  }

  console.log('Seed completed successfully');
  console.log('Admin user: admin@example.com / admin123');
  console.log('Test user: test@example.com / test123');
  console.log('Main store created with ID:', mainStore.id);
  console.log('Default customer created with ID:', defaultCustomer.id);
  console.log('Products created:', products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });