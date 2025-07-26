-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS "product" (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  "costPrice" DECIMAL(10,2),
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "minStockLevel" INTEGER DEFAULT 0,
  sku VARCHAR(50),
  barcode VARCHAR(50),
  category VARCHAR(100),
  brand VARCHAR(100),
  unit VARCHAR(20),
  weight DECIMAL(5,2),
  "weightUnit" VARCHAR(20),
  "imageUrl" VARCHAR(500),
  "isActive" BOOLEAN DEFAULT true,
  "storeId" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("storeId") REFERENCES "store"(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "IDX_product_store" ON "product" ("storeId");
CREATE INDEX IF NOT EXISTS "IDX_product_category" ON "product" (category);
CREATE INDEX IF NOT EXISTS "IDX_product_brand" ON "product" (brand);
CREATE INDEX IF NOT EXISTS "IDX_product_sku" ON "product" (sku);
CREATE INDEX IF NOT EXISTS "IDX_product_barcode" ON "product" (barcode);
CREATE INDEX IF NOT EXISTS "IDX_product_stock" ON "product" ("stockQuantity");

-- Criar índice único para SKU (se não for nulo)
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_sku_unique" ON "product" (sku) WHERE sku IS NOT NULL;

-- Criar índice único para barcode (se não for nulo)
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_barcode_unique" ON "product" (barcode) WHERE barcode IS NOT NULL; 