-- Insert sample invoices
INSERT INTO invoices (id, invoice_number, customer_id, order_id, amount, tax, discount, total, status, due_date, notes) VALUES
(
    '8E16F3F3-2731-4D57-AD7F-F10650615A88',
    'INV-2024-001',
    '4F461257-2F49-4667-83E4-A9510DDAE575', -- Maria Silva
    '6E16F3F3-2731-4D57-AD7F-F10650615A77', -- ORD-2024-001
    2899.98,
    289.99,
    100.00,
    3089.97,
    'paid',
    '2024-02-15',
    'Fatura paga com sucesso'
),
(
    '9F24E4C-4373-46D7-8D12-C00CED1B77CB',
    'INV-2024-002',
    '3798B617-7279-4242-BB4C-AD98C73F33F6', -- João Santos
    'A5F24E4C-4373-46D7-8D12-C00CED1B77BA', -- ORD-2024-002
    999.98,
    99.99,
    50.00,
    1049.97,
    'sent',
    '2024-02-20',
    'Fatura enviada aguardando pagamento'
),
(
    'A0288B27-6F92-40E0-B62C-F36FD2F55DC4',
    'INV-2024-003',
    '028AAE24-CAF7-43CB-8D1D-9D72060E802C', -- Ana Costa
    '20288B27-6F92-40E0-B62C-F36FD2F55DC3', -- ORD-2024-003
    1299.99,
    129.99,
    0.00,
    1429.98,
    'sent',
    '2024-02-25',
    'Fatura enviada para entrega'
),
(
    'BAF754596-6C8F-4FE3-A7DF-3E8F287F62BA',
    'INV-2024-004',
    '4230E4F5-4489-44FC-8DEC-D3275CFFA594', -- Pedro Lima
    'AF754596-6C8F-4FE3-A7DF-3E8F287F62A9', -- ORD-2024-004
    1567.48,
    156.74,
    32.50,
    1691.72,
    'draft',
    '2024-03-01',
    'Fatura em rascunho'
),
(
    'C7655F47E-D65F-43EB-BB4D-0715E9CBC3D6',
    'INV-2024-005',
    '70CB1B88-D8EF-4F7D-B844-6B2E33F347CA', -- Carla Dias
    '7655F47E-D65F-43EB-BB4D-0715E9CBC3D5', -- ORD-2024-005
    982.00,
    98.20,
    18.00,
    1062.20,
    'overdue',
    '2024-01-15',
    'Fatura vencida'
)
ON CONFLICT (invoice_number) DO NOTHING;
