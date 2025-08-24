-- Insert sample orders
INSERT INTO orders (id, order_number, customer_id, store_id, total, discount, tax, status, notes) VALUES
(
    '6E16F3F3-2731-4D57-AD7F-F10650615A77',
    'ORD-2024-001',
    '4F461257-2F49-4667-83E4-A9510DDAE575', -- Maria Silva
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    2899.98,
    100.00,
    289.99,
    'delivered',
    'Pedido entregue com sucesso'
),
(
    'A5F24E4C-4373-46D7-8D12-C00CED1B77BA',
    'ORD-2024-002',
    '3798B617-7279-4242-BB4C-AD98C73F33F6', -- João Santos
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    999.98,
    50.00,
    99.99,
    'processing',
    'Pedido em processamento'
),
(
    '20288B27-6F92-40E0-B62C-F36FD2F55DC3',
    'ORD-2024-003',
    '028AAE24-CAF7-43CB-8D1D-9D72060E802C', -- Ana Costa
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Filial Norte
    1299.99,
    0.00,
    129.99,
    'shipped',
    'Pedido enviado para entrega'
),
(
    'AF754596-6C8F-4FE3-A7DF-3E8F287F62A9',
    'ORD-2024-004',
    '4230E4F5-4489-44FC-8DEC-D3275CFFA594', -- Pedro Lima
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    1567.48,
    32.50,
    156.74,
    'confirmed',
    'Pedido confirmado aguardando processamento'
),
(
    '7655F47E-D65F-43EB-BB4D-0715E9CBC3D5',
    'ORD-2024-005',
    '70CB1B88-D8EF-4F7D-B844-6B2E33F347CA', -- Carla Dias
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    982.00,
    18.00,
    98.20,
    'pending',
    'Aguardando confirmação de pagamento'
)
ON CONFLICT (order_number) DO NOTHING;
