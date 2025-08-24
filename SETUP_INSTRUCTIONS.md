# 🚀 Instruções de Setup - Prisma + Cloro Backend

## 📋 Passo a Passo para Configurar o Prisma

### 1. 🐳 Iniciar o Banco de Dados

#### Opção A: Com Docker (Recomendado)
```bash
# Iniciar o Docker Desktop
# Abrir o terminal e navegar para a pasta do projeto
cd cloro-backend

# Iniciar o banco de dados
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

#### Opção B: PostgreSQL Local
Se você tiver PostgreSQL instalado localmente:
1. Criar um banco chamado `cloro_db`
2. Criar um usuário `cloro_user` com senha `cloro_password`
3. Atualizar o `.env` com suas configurações locais

### 2. 🔧 Configurar o Ambiente

Verificar se o arquivo `.env` contém:
```env
DATABASE_URL="postgresql://cloro_user:cloro_password@localhost:5433/cloro_db?schema=public"
```

### 3. 🗄️ Executar Migrations

```bash
# Gerar o cliente Prisma (já feito)
yarn db:generate

# Criar e aplicar as migrations
yarn db:migrate
```

### 4. 🌱 Executar Seeds

```bash
# Popular o banco com dados iniciais
yarn db:seed
```

### 5. 🧪 Testar a Configuração

```bash
# Iniciar o servidor
yarn start:dev

# Em outro terminal, abrir o Prisma Studio
yarn db:studio
```

## 🔍 Verificações Importantes

### ✅ Banco de Dados
- [ ] Docker rodando ou PostgreSQL local ativo
- [ ] Conexão testada com `yarn db:studio`
- [ ] Variáveis de ambiente configuradas

### ✅ Prisma
- [ ] Cliente gerado (`yarn db:generate`)
- [ ] Migrations aplicadas (`yarn db:migrate`)
- [ ] Seeds executados (`yarn db:seed`)

### ✅ NestJS
- [ ] Servidor iniciando sem erros
- [ ] PrismaModule importado no AppModule
- [ ] TypeOrmModule removido

## 🚨 Solução de Problemas

### Erro: "Can't reach database server"
```bash
# Verificar se o Docker está rodando
docker --version
docker-compose --version

# Verificar se o container está ativo
docker-compose ps

# Verificar logs do container
docker-compose logs postgres
```

### Erro: "Database does not exist"
```bash
# Conectar ao PostgreSQL e criar o banco
docker-compose exec postgres psql -U cloro_user -d postgres
CREATE DATABASE cloro_db;
\q
```

### Erro: "Permission denied"
```bash
# Verificar permissões do usuário
docker-compose exec postgres psql -U cloro_user -d cloro_db
GRANT ALL PRIVILEGES ON DATABASE cloro_db TO cloro_user;
```

## 📚 Comandos Úteis

```bash
# Status do banco
yarn db:migrate:status

# Resetar banco (desenvolvimento)
yarn db:migrate:reset

# Forçar sincronização (desenvolvimento)
yarn db:push

# Visualizar dados
yarn db:studio

# Validar schema
yarn db:validate
```

## 🎯 Próximos Passos

Após configurar o Prisma:

1. **Atualizar os Services**: Substituir TypeORM por Prisma
2. **Atualizar os Repositories**: Usar PrismaService
3. **Testar as APIs**: Verificar se tudo está funcionando
4. **Implementar novos recursos**: Usar o Prisma para novas funcionalidades

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do Docker: `docker-compose logs`
2. Verificar logs do NestJS: `yarn start:dev`
3. Consultar a documentação do Prisma
4. Verificar o arquivo `PRISMA_README.md`
