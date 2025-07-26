-- Criar tabela de stores
CREATE TABLE IF NOT EXISTS "store" (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  "zipCode" VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  website VARCHAR(255),
  "isActive" BOOLEAN DEFAULT true,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice único para o nome da loja
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_name" ON "store" (name);

-- Criar índice para busca por cidade
CREATE INDEX IF NOT EXISTS "IDX_store_city" ON "store" (city);

-- Criar índice para busca por estado
CREATE INDEX IF NOT EXISTS "IDX_store_state" ON "store" (state); 