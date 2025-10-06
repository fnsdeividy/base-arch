-- Insert sample customers
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, state, zip_code, birth_date, is_active) VALUES
(
    '4F461257-2F49-4667-83E4-A9510DDAE575',
    'Maria',
    'Silva',
    'maria@email.com',
    '+55 11 99999-1111',
    'Rua das Flores, 123',
    'São Paulo',
    'SP',
    '01234-567',
    '1985-03-15',
    true
),
(
    '3798B617-7279-4242-BB4C-AD98C73F33F6',
    'João',
    'Santos',
    'joao@email.com',
    '+55 11 88888-2222',
    'Av. Paulista, 456',
    'São Paulo',
    'SP',
    '01310-100',
    '1990-07-22',
    true
),
(
    '028AAE24-CAF7-43CB-8D1D-9D72060E802C',
    'Ana',
    'Costa',
    'ana@email.com',
    '+55 11 77777-3333',
    'Rua Augusta, 789',
    'São Paulo',
    'SP',
    '01305-000',
    '1988-11-08',
    true
),
(
    '4230E4F5-4489-44FC-8DEC-D3275CFFA594',
    'Pedro',
    'Lima',
    'pedro@email.com',
    '+55 11 66666-4444',
    'Rua Oscar Freire, 321',
    'São Paulo',
    'SP',
    '01426-001',
    '1992-05-30',
    true
),
(
    '70CB1B88-D8EF-4F7D-B844-6B2E33F347CA',
    'Carla',
    'Dias',
    'carla@email.com',
    '+55 11 55555-5555',
    'Rua Haddock Lobo, 654',
    'São Paulo',
    'SP',
    '01414-001',
    '1987-09-12',
    true
)
ON CONFLICT (email) DO NOTHING;
