-- Adicionar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alterar a coluna id da tabela users para UUID
-- Primeiro, adicionar uma nova coluna UUID
ALTER TABLE "user" ADD COLUMN id_new UUID;

-- Gerar UUIDs para registros existentes
UPDATE "user" SET id_new = uuid_generate_v4();

-- Remover a coluna antiga e renomear a nova
ALTER TABLE "user" DROP COLUMN id;
ALTER TABLE "user" RENAME COLUMN id_new TO id;

-- Definir como chave primária
ALTER TABLE "user" ADD PRIMARY KEY (id); 