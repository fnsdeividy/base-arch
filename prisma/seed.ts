import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin - Cassio
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser1 = await prisma.user.upsert({
    where: { email: 'cassiobrr@gmail.com' },
    update: {},
    create: {
      email: 'cassiobrr@gmail.com',
      password: hashedPassword,
      firstName: 'Cassio',
      lastName: 'Admin',
      isActive: true,
      emailVerified: true,
    },
  });

  // Criar usuário admin - Cristiano
  const adminUser2 = await prisma.user.upsert({
    where: { email: 'cristianosenna79@gmail.com' },
    update: {},
    create: {
      email: 'cristianosenna79@gmail.com',
      password: hashedPassword,
      firstName: 'Cristiano',
      lastName: 'Senna',
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

  // Associar usuários ao role admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser1.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser1.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser2.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser2.id,
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

  // Criar produtos de limpeza
  const products = [
    {
      id: 'B96D1208-BF58-4A45-8307-24005C8C46C8',
      name: 'Desinfetante Cloro Ativo 5L',
      description: 'Desinfetante concentrado à base de cloro ativo para limpeza pesada e desinfecção de superfícies',
      price: 24.99,
      sku: 'DESINF-CL-5L',
      category: 'Desinfetantes',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: '0A915B12-C5CD-4978-BF09-2C7D275B082C',
      name: 'Detergente Neutro Multiuso 1L',
      description: 'Detergente neutro concentrado para limpeza geral, pisos, azulejos e superfícies diversas',
      price: 12.50,
      sku: 'DET-NEUT-1L',
      category: 'Detergentes',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: '4226C6AC-38CF-41A0-B9D8-4A13906333EF',
      name: 'Álcool Gel 70% Antisséptico 500ml',
      description: 'Álcool gel 70% para higienização das mãos e superfícies, com ação antisséptica',
      price: 8.90,
      sku: 'ALC-GEL-500ML',
      category: 'Antissépticos',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: 'F1A2B3C4-D5E6-F7G8-H9I0-J1K2L3M4N5O6',
      name: 'Sabão em Pó Enzimático 2kg',
      description: 'Sabão em pó com enzimas ativas para remoção de manchas difíceis e limpeza profunda',
      price: 18.75,
      sku: 'SAB-ENZ-2KG',
      category: 'Sabões',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: 'A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6',
      name: 'Limpa Vidros Spray 500ml',
      description: 'Limpa vidros profissional em spray, remove sujeira e gordura sem deixar manchas',
      price: 9.99,
      sku: 'LV-SPRAY-500ML',
      category: 'Limpadores Especiais',
      storeId: mainStore.id,
      isActive: true,
    },
    {
      id: 'Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6',
      name: 'Água Sanitária 2L',
      description: 'Água sanitária concentrada para desinfecção, branqueamento e limpeza de banheiros',
      price: 6.50,
      sku: 'AG-SAN-2L',
      category: 'Desinfetantes',
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
  console.log('Admin users:');
  console.log('  - cassiobrr@gmail.com / admin123');
  console.log('  - cristianosenna79@gmail.com / admin123');
  console.log('Test user: test@example.com / test123');
  console.log('Cashier user: caixa@example.com / caixa123');
  console.log('Main store created with ID:', mainStore.id);
  console.log('Default customer created with ID:', defaultCustomer.id);
  console.log('Cleaning products created:', products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });