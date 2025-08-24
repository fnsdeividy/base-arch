# Prisma Setup - Cloro Backend

Este documento descreve a configuração e uso do Prisma ORM no projeto Cloro Backend.

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- Docker (opcional, para desenvolvimento local)

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

```bash
yarn add prisma @prisma/client
yarn add -D @types/node
```

### 2. Configuração do Ambiente

Certifique-se de que o arquivo `.env` contenha a variável `DATABASE_URL`:

```env
DATABASE_URL="postgresql://cloro_user:cloro_password@localhost:5433/cloro_db?schema=public"
```

### 3. Gerar Cliente Prisma

```bash
yarn db:generate
```

## 🗄️ Comandos do Banco de Dados

### Migrations

```bash
# Criar uma nova migration
yarn db:migrate

# Aplicar migrations em produção
yarn db:migrate:deploy

# Resetar banco (desenvolvimento/teste)
yarn db:migrate:reset

# Verificar status das migrations
yarn db:migrate:status
```

### Seeds

```bash
# Executar seeds
yarn db:seed
```

### Outros Comandos

```bash
# Sincronizar schema com banco (desenvolvimento)
yarn db:push

# Abrir Prisma Studio
yarn db:studio

# Validar schema
yarn db:validate

# Formatar schema
yarn db:format
```

## 📊 Schema do Banco

O schema do Prisma inclui os seguintes modelos:

- **User**: Usuários do sistema
- **Role**: Papéis/perfis de usuário
- **Permission**: Permissões do sistema
- **UserRole**: Relacionamento usuário-papel
- **RolePermission**: Relacionamento papel-permissão
- **Session**: Sessões ativas dos usuários
- **AuditLog**: Logs de auditoria

## 🔐 Dados Iniciais

O seed cria automaticamente:

### Roles
- `admin`: Administrador com acesso total
- `user`: Usuário com permissões básicas
- `moderator`: Moderador com permissões elevadas

### Permissões
- CRUD completo para usuários
- CRUD completo para roles
- Leitura de permissões
- Atribuição de permissões
- Leitura de logs de auditoria

### Usuários
- **Admin**: `admin@cloro.com` / `admin123`
- **User 1**: `user1@cloro.com` / `user123`
- **User 2**: `user2@cloro.com` / `user123`

## 🏗️ Estrutura do Projeto

```
src/
├── modules/
│   └── prisma/
│       ├── prisma.module.ts      # Módulo NestJS
│       ├── prisma.service.ts     # Serviço com lifecycle hooks
│       └── index.ts              # Exports
├── config/
│   └── prisma.config.ts          # Configuração do cliente
└── prisma/
    ├── schema.prisma             # Schema do banco
    └── seed.ts                   # Script de seed
```

## 🔄 Migração do TypeORM

O projeto foi migrado do TypeORM para o Prisma. Principais mudanças:

1. **Removido**: `@nestjs/typeorm`, `typeorm`, `pg`
2. **Adicionado**: `prisma`, `@prisma/client`
3. **Substituído**: `TypeOrmModule` por `PrismaModule`
4. **Atualizado**: Scripts do package.json

## 🧪 Desenvolvimento

### 1. Iniciar Banco de Dados

```bash
# Com Docker
docker-compose up -d

# Ou conectar em banco existente
```

### 2. Executar Migrations

```bash
yarn db:migrate
```

### 3. Executar Seeds

```bash
yarn db:seed
```

### 4. Desenvolver

```bash
yarn start:dev
```

### 5. Visualizar Dados

```bash
yarn db:studio
```

## 📝 Exemplo de Uso

### No Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
}
```

### No Controller

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
```

## 🚨 Troubleshooting

### Erro de Conexão

```bash
# Verificar se o banco está rodando
docker-compose ps

# Verificar variáveis de ambiente
cat .env

# Testar conexão
yarn db:studio
```

### Erro de Migration

```bash
# Resetar banco
yarn db:migrate:reset

# Forçar push do schema
yarn db:push
```

### Erro de Seed

```bash
# Verificar se o banco tem as tabelas
yarn db:studio

# Executar migrations primeiro
yarn db:migrate
```

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Prisma com NestJS](https://docs.nestjs.com/techniques/database#prisma)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
