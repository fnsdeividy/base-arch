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

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Roles: ${[adminRole, userRole, moderatorRole].length}`);
  console.log(`- Permissions: ${permissions.length}`);
  console.log(`- Users: ${[adminUser, ...sampleUsers].length}`);
  console.log(`- Audit Logs: ${auditLogs.length}`);
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
