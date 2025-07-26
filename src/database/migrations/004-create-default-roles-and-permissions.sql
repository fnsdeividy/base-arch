-- Migration: Create default roles and permissions for access levels
-- This migration creates the four access levels: super-admin, admin, participant, store-client

-- Insert the four main roles
INSERT INTO roles (name, description, is_system) VALUES
('super-admin', 'Super administrator with full system access', true),
('admin', 'Administrator with elevated permissions', true),
('participant', 'Participant with moderate access', true),
('store-client', 'Store client with limited access', true)
ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive permissions for all resources
INSERT INTO permissions (name, description, resource, action) VALUES
-- User management permissions
('users.read', 'Read user information', 'users', 'read'),
('users.create', 'Create new users', 'users', 'create'),
('users.update', 'Update user information', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),
('users.manage-roles', 'Manage user roles', 'users', 'manage-roles'),

-- Role management permissions
('roles.read', 'Read role information', 'roles', 'read'),
('roles.create', 'Create new roles', 'roles', 'create'),
('roles.update', 'Update role information', 'roles', 'update'),
('roles.delete', 'Delete roles', 'roles', 'delete'),

-- Permission management permissions
('permissions.read', 'Read permission information', 'permissions', 'read'),
('permissions.create', 'Create new permissions', 'permissions', 'create'),
('permissions.update', 'Update permission information', 'permissions', 'update'),
('permissions.delete', 'Delete permissions', 'permissions', 'delete'),
('permissions.assign', 'Assign permissions to roles', 'permissions', 'assign'),

-- Audit and system permissions
('audit.read', 'Read audit logs', 'audit', 'read'),
('audit.export', 'Export audit logs', 'audit', 'export'),
('system.config', 'Configure system settings', 'system', 'config'),
('system.monitor', 'Monitor system health', 'system', 'monitor'),

-- Store management permissions (for future use)
('stores.read', 'Read store information', 'stores', 'read'),
('stores.create', 'Create new stores', 'stores', 'create'),
('stores.update', 'Update store information', 'stores', 'update'),
('stores.delete', 'Delete stores', 'stores', 'delete'),
('stores.manage', 'Manage store operations', 'stores', 'manage'),

-- Product management permissions (for future use)
('products.read', 'Read product information', 'products', 'read'),
('products.create', 'Create new products', 'products', 'create'),
('products.update', 'Update product information', 'products', 'update'),
('products.delete', 'Delete products', 'products', 'delete'),
('products.manage', 'Manage product operations', 'products', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to super-admin role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'super-admin'),
    id
FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to admin role (most permissions except system config)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    id
FROM permissions 
WHERE name NOT IN ('system.config', 'permissions.create', 'permissions.update', 'permissions.delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to participant role (read access and basic operations)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'participant'),
    id
FROM permissions 
WHERE name IN (
    'users.read',
    'roles.read',
    'permissions.read',
    'audit.read',
    'stores.read',
    'products.read',
    'stores.create',
    'stores.update',
    'products.create',
    'products.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to store-client role (limited read access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'store-client'),
    id
FROM permissions 
WHERE name IN (
    'users.read',
    'stores.read',
    'products.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING; 