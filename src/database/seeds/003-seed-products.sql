-- Insert sample products
INSERT INTO products (id, name, description, price, sku, category, image_url, store_id, is_active) VALUES
(
    'B96D1208-BF58-4A45-8307-24005C8C46C8',
    'Notebook Dell Inspiron 15',
    'Notebook Dell Inspiron 15 com processador Intel Core i5, 8GB RAM, 256GB SSD',
    2499.99,
    'NB-DELL-001',
    'Notebooks',
    'https://via.placeholder.com/300x300?text=Dell+Notebook',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    true
),
(
    '0A915B12-C5CD-4978-BF09-2C7D275B082C',
    'Mouse Logitech MX Master 3',
    'Mouse sem fio Logitech MX Master 3 com sensor de alta precisão',
    399.99,
    'MS-LOG-001',
    'Periféricos',
    'https://via.placeholder.com/300x300?text=Logitech+Mouse',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    true
),
(
    '4226C6AC-38CF-41A0-B9D8-4A13906333EF',
    'Teclado Mecânico Keychron K2',
    'Teclado mecânico sem fio Keychron K2 com switches Brown',
    599.99,
    'KB-KEY-001',
    'Periféricos',
    'https://via.placeholder.com/300x300?text=Keychron+Keyboard',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    true
),
(
    '87EE765B-58CB-413B-85B0-65BCDC35D29D',
    'Monitor LG UltraWide 29"',
    'Monitor LG UltraWide 29" Full HD IPS com tecnologia HDR',
    1299.99,
    'MN-LG-001',
    'Monitores',
    'https://via.placeholder.com/300x300?text=LG+Monitor',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    true
),
(
    'B2846843-7CB1-43D4-811C-D015CD7FAAFC',
    'SSD Samsung 980 PRO 1TB',
    'SSD NVMe Samsung 980 PRO 1TB com velocidades de até 7.000 MB/s',
    899.99,
    'SSD-SAM-001',
    'Armazenamento',
    'https://via.placeholder.com/300x300?text=Samsung+SSD',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    true
)
ON CONFLICT (id) DO NOTHING;
