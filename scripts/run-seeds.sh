#!/bin/bash

# Script para executar seeds
echo "🌱 Executando seeds..."

# Configurações do banco
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-cloro_db}
DB_USER=${DB_USER:-cloro_user}
DB_PASS=${DB_PASS:-cloro_password}

# Diretório das seeds
SEEDS_DIR="src/database/seeds"

# Verificar se o diretório existe
if [ ! -d "$SEEDS_DIR" ]; then
    echo "❌ Diretório de seeds não encontrado: $SEEDS_DIR"
    exit 1
fi

# Executar cada seed em ordem
for seed in $SEEDS_DIR/*.sql; do
    if [ -f "$seed" ]; then
        echo "🌱 Executando $(basename "$seed")..."
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$seed"
        
        if [ $? -eq 0 ]; then
            echo "✅ $(basename "$seed") executada com sucesso"
        else
            echo "❌ Erro ao executar $(basename "$seed")"
            exit 1
        fi
    fi
done

echo "🎉 Todas as seeds foram executadas com sucesso!"
