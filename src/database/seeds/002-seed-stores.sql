-- Insert default stores
INSERT INTO stores (id, name, description, address, phone, email, is_active) VALUES
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Loja Principal',
    'Loja principal do sistema Cloro',
    'Rua Principal, 123, Centro - São Paulo, SP',
    '+55 11 3333-3333',
    'principal@cloro.com',
    true
),
(
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Filial Norte',
    'Filial localizada na zona norte',
    'Av. Norte, 456, Santana - São Paulo, SP',
    '+55 11 4444-4444',
    'norte@cloro.com',
    true
)
ON CONFLICT (id) DO NOTHING;
