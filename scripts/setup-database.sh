#!/bin/bash

# Script para configurar o banco de dados completo
echo "🔧 Configurando banco de dados..."

# Tornar os scripts executáveis
chmod +x scripts/run-migrations.sh
chmod +x scripts/run-seeds.sh

# Aguardar o banco estar disponível
echo "⏳ Aguardando PostgreSQL estar disponível..."
sleep 10

echo "✅ PostgreSQL deve estar disponível!"

# Executar migrations
echo "📝 Executando migrations..."
./scripts/run-migrations.sh

# Executar seeds
echo "🌱 Executando seeds..."
./scripts/run-seeds.sh

echo "🎉 Banco de dados configurado com sucesso!"
echo ""
echo "📊 Dados disponíveis:"
echo "  - Usuário admin: admin@cloro.com (senha: 123456)"
echo "  - Usuário teste: joao@cloro.com (senha: 123456)"
echo "  - 2 lojas configuradas"
echo "  - 5 produtos de exemplo"
echo "  - 5 clientes de exemplo"
echo "  - Estoque configurado"
echo "  - 5 pedidos de exemplo"
