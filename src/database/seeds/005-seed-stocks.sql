-- Insert sample stock entries
INSERT INTO stocks (id, product_id, store_id, quantity, min_quantity, max_quantity) VALUES
(
    '824FEABE-0A19-40DB-9004-753F48146627',
    'B96D1208-BF58-4A45-8307-24005C8C46C8', -- Notebook Dell
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    15,
    5,
    50
),
(
    '3C81771D-5161-4D0A-A06B-BE7AD1F03378',
    '0A915B12-C5CD-4978-BF09-2C7D275B082C', -- Mouse Logitech
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    45,
    10,
    100
),
(
    'DB2D5F63-687C-4F61-A3AC-854D621A95BD',
    '4226C6AC-38CF-41A0-B9D8-4A13906333EF', -- Teclado Keychron
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    8,
    5,
    30
),
(
    '1501F6BF-0395-46EA-B3FE-24585163C79F',
    '87EE765B-58CB-413B-85B0-65BCDC35D29D', -- Monitor LG
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Filial Norte
    12,
    3,
    25
),
(
    '095ECDCF-9D10-4423-9555-DEAB7F1C7147',
    'B2846843-7CB1-43D4-811C-D015CD7FAAFC', -- SSD Samsung
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Loja Principal
    25,
    10,
    80
),
-- Produtos com estoque baixo para demonstração
(
    'C6F85780-81FE-40BE-8CF5-8873DECEC3D1',
    'B96D1208-BF58-4A45-8307-24005C8C46C8', -- Notebook Dell
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Filial Norte
    2, -- Estoque baixo
    5,
    20
),
(
    'DA81F200-5058-4317-9531-9A118D2AFB90',
    '4226C6AC-38CF-41A0-B9D8-4A13906333EF', -- Teclado Keychron
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Filial Norte
    3, -- Estoque baixo
    5,
    15
)
ON CONFLICT (product_id, store_id) DO NOTHING;
