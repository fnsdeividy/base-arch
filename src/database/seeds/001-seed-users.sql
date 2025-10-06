-- Insert default admin user
-- Password: 123456 (hashed with bcrypt)
INSERT INTO users (id, first_name, last_name, email, password, phone, is_active) VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Admin',
    'User',
    'admin@cloro.com',
    '$2b$10$rQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ',
    '+55 11 99999-9999',
    true
),
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'João',
    'Silva',
    'joao@cloro.com',
    '$2b$10$rQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ',
    '+55 11 88888-8888',
    true
)
ON CONFLICT (email) DO NOTHING;
