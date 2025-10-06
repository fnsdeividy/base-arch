#!/bin/bash

# Script para executar migrations
echo "🚀 Executando migrations..."

# Configurações do banco
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-cloro_db}
DB_USER=${DB_USER:-cloro_user}
DB_PASS=${DB_PASS:-cloro_password}

# Diretório das migrations
MIGRATIONS_DIR="src/database/migrations"

# Verificar se o diretório existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Diretório de migrations não encontrado: $MIGRATIONS_DIR"
    exit 1
fi

# Executar cada migration em ordem
for migration in $MIGRATIONS_DIR/*.sql; do
    if [ -f "$migration" ]; then
        echo "📝 Executando $(basename "$migration")..."
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
        
        if [ $? -eq 0 ]; then
            echo "✅ $(basename "$migration") executada com sucesso"
        else
            echo "❌ Erro ao executar $(basename "$migration")"
            exit 1
        fi
    fi
done

echo "🎉 Todas as migrations foram executadas com sucesso!"
