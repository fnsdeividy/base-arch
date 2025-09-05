# Deploy no Render - Configurações Otimizadas

## Configurações de Memória

Este projeto foi otimizado para funcionar com o limite de 512MB do plano gratuito do Render.

### Comandos de Build Otimizados

- **Build Command**: `npm run build:prod`
- **Start Command**: `npm run start:prod`

### Variáveis de Ambiente Necessárias

```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=400 --optimize-for-size
CI=true
```

### Otimizações Implementadas

1. **Webpack Otimizado**:
   - Minificação desabilitada para economizar memória
   - Split chunks desabilitado
   - Output reduzido (errors-only)

2. **TypeScript Otimizado**:
   - Source maps desabilitados
   - Declarações desabilitadas
   - Target ES2020 para melhor performance

3. **Node.js Otimizado**:
   - Limite de memória: 400MB
   - Otimização para tamanho
   - Cache limpo antes do build

### Troubleshooting

Se ainda houver problemas de memória:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Use o comando `npm run build:prod` no Render
3. Considere upgrade para um plano pago se necessário

### Monitoramento

O build deve completar em aproximadamente 4-8 segundos com essas otimizações.
