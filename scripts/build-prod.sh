#!/bin/bash

# Script otimizado para build em produção com limite de memória

# Configurações de memória para Node.js
export NODE_OPTIONS="--max-old-space-size=400 --optimize-for-size"

# Configurações para reduzir uso de memória durante o build
export NODE_ENV=production
export CI=true

echo "🚀 Iniciando build otimizado para produção..."

# Limpar cache do npm para liberar memória
echo "🧹 Limpando cache..."
npm cache clean --force 2>/dev/null || true

# Instalar dependências apenas de produção
echo "📦 Instalando dependências..."
npm ci --only=production --silent

# Build otimizado
echo "🔨 Executando build..."
npx nest build --webpack-config webpack.config.js

echo "✅ Build concluído com sucesso!"
