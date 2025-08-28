#!/bin/bash

# Script para executar todos os testes do sistema
# Desenvolvido como um senior developer

echo "🚀 Iniciando execução de testes do sistema Rosy Sales Flow"
echo "=================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto (cloro-backend)"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    yarn install
fi

# Verificar se o banco de dados está configurado
echo "🔍 Verificando configuração do banco de dados..."

# Criar arquivo de configuração de teste se não existir
if [ ! -f ".env.test" ]; then
    echo "📝 Criando arquivo de configuração de teste..."
    cat > .env.test << EOF
# Configuração de teste
NODE_ENV=test
DATABASE_URL="postgresql://cloro_user:cloro_password@localhost:5433/cloro_test_db"
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h
EOF
fi

# Verificar se o banco de teste existe
echo "🗄️ Verificando banco de dados de teste..."
if ! psql -h localhost -U cloro_user -d cloro_test_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "⚠️ Banco de teste não encontrado. Criando..."
    createdb -h localhost -U cloro_user cloro_test_db 2>/dev/null || echo "❌ Erro ao criar banco de teste"
fi

# Executar migrações do banco de teste
echo "🔄 Executando migrações do banco de teste..."
yarn db:migrate:reset --force

# Executar seeds do banco de teste
echo "🌱 Executando seeds do banco de teste..."
yarn db:seed

echo ""
echo "🧪 Executando testes unitários..."
echo "=================================================="

# Executar testes unitários
yarn test --coverage --verbose

if [ $? -eq 0 ]; then
    echo "✅ Testes unitários executados com sucesso!"
else
    echo "❌ Falha nos testes unitários"
    exit 1
fi

echo ""
echo "🔗 Executando testes de integração..."
echo "=================================================="

# Executar testes de integração
yarn test:e2e --verbose

if [ $? -eq 0 ]; then
    echo "✅ Testes de integração executados com sucesso!"
else
    echo "❌ Falha nos testes de integração"
    exit 1
fi

echo ""
echo "📊 Executando testes de cobertura..."
echo "=================================================="

# Executar testes com cobertura
yarn test:cov

echo ""
echo "🎯 Executando testes específicos do módulo Stock..."
echo "=================================================="

# Executar testes específicos do módulo Stock
yarn test src/modules/stock --coverage --verbose

echo ""
echo "🔍 Verificando qualidade do código..."
echo "=================================================="

# Executar linting
echo "📝 Executando ESLint..."
yarn lint

# Executar formatação
echo "🎨 Verificando formatação..."
yarn format

echo ""
echo "=================================================="
echo "🎉 Todos os testes foram executados com sucesso!"
echo "📈 Cobertura de testes disponível em: coverage/"
echo "🔍 Relatórios detalhados gerados"
echo "=================================================="

# Mostrar resumo da cobertura
if [ -f "coverage/coverage-summary.json" ]; then
    echo ""
    echo "📊 Resumo da Cobertura:"
    echo "========================"
    cat coverage/coverage-summary.json | jq -r '.total | "Statements: \(.statements.pct)% | Branches: \(.branches.pct)% | Functions: \(.functions.pct)% | Lines: \(.lines.pct)%"'
fi

echo ""
echo "🚀 Sistema pronto para produção!"



