# Níveis de Acesso - Sistema de Autorização

## Visão Geral

O sistema implementa um modelo de controle de acesso baseado em roles (RBAC - Role-Based Access Control) com quatro níveis principais de acesso:

## 1. Super Admin (super-admin)

**Descrição:** Administrador com acesso total ao sistema

**Permissões:**

- ✅ **Usuários:** Leitura, criação, atualização, exclusão, gerenciamento de roles
- ✅ **Roles:** Leitura, criação, atualização, exclusão
- ✅ **Permissões:** Leitura, criação, atualização, exclusão, atribuição
- ✅ **Auditoria:** Leitura, exportação
- ✅ **Sistema:** Configuração, monitoramento
- ✅ **Lojas:** Leitura, criação, atualização, exclusão, gerenciamento
- ✅ **Produtos:** Leitura, criação, atualização, exclusão, gerenciamento

**Uso:** Administração completa do sistema, configurações críticas, gerenciamento de segurança

## 2. Admin (admin)

**Descrição:** Administrador com acesso elevado, mas limitado

**Permissões:**

- ✅ **Usuários:** Leitura, criação, atualização, exclusão, gerenciamento de roles
- ✅ **Roles:** Leitura, atualização
- ❌ **Roles:** Criação, exclusão
- ✅ **Permissões:** Leitura, atribuição
- ❌ **Permissões:** Criação, atualização, exclusão
- ✅ **Auditoria:** Leitura, exportação
- ❌ **Sistema:** Configuração
- ✅ **Sistema:** Monitoramento
- ✅ **Lojas:** Leitura, criação, atualização, exclusão, gerenciamento
- ✅ **Produtos:** Leitura, criação, atualização, exclusão, gerenciamento

**Uso:** Administração operacional, gerenciamento de usuários e conteúdo

## 3. Participant (participant)

**Descrição:** Usuário participante com acesso moderado

**Permissões:**

- ✅ **Usuários:** Leitura
- ❌ **Usuários:** Criação, atualização, exclusão, gerenciamento de roles
- ✅ **Roles:** Leitura
- ❌ **Roles:** Criação, atualização, exclusão
- ✅ **Permissões:** Leitura
- ❌ **Permissões:** Criação, atualização, exclusão, atribuição
- ✅ **Auditoria:** Leitura
- ❌ **Auditoria:** Exportação
- ❌ **Sistema:** Configuração, monitoramento
- ✅ **Lojas:** Leitura, criação, atualização
- ❌ **Lojas:** Exclusão, gerenciamento
- ✅ **Produtos:** Leitura, criação, atualização
- ❌ **Produtos:** Exclusão, gerenciamento

**Uso:** Participação ativa no sistema, criação e edição de conteúdo

## 4. Store Client (store-client)

**Descrição:** Cliente de loja com acesso limitado

**Permissões:**

- ✅ **Usuários:** Leitura
- ❌ **Usuários:** Criação, atualização, exclusão, gerenciamento de roles
- ❌ **Roles:** Leitura, criação, atualização, exclusão
- ❌ **Permissões:** Leitura, criação, atualização, exclusão, atribuição
- ❌ **Auditoria:** Leitura, exportação
- ❌ **Sistema:** Configuração, monitoramento
- ✅ **Lojas:** Leitura
- ❌ **Lojas:** Criação, atualização, exclusão, gerenciamento
- ✅ **Produtos:** Leitura
- ❌ **Produtos:** Criação, atualização, exclusão, gerenciamento

**Uso:** Visualização de conteúdo, acesso básico ao sistema

## Estrutura Técnica

### Entidades

```typescript
// User Entity
@Entity()
export class User {
  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}

// Role Entity
@Entity('roles')
export class Role {
  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}

// Permission Entity
@Entity('permissions')
export class Permission {
  resource: string; // 'users', 'roles', 'permissions', etc.
  action: string; // 'read', 'create', 'update', 'delete', etc.
}
```

### Endpoints de Autorização

#### Roles

- `GET /roles` - Listar todas as roles
- `GET /roles/system` - Listar roles do sistema
- `GET /roles/:id` - Obter role específica
- `GET /roles/:id/permissions` - Obter role com permissões
- `POST /roles` - Criar nova role
- `PATCH /roles/:id` - Atualizar role
- `DELETE /roles/:id` - Excluir role

#### Permissões

- `GET /permissions` - Listar todas as permissões
- `GET /permissions/resource/:resource` - Listar permissões por recurso
- `GET /permissions/check?resource=&action=` - Verificar permissão específica
- `GET /permissions/:id` - Obter permissão específica
- `POST /permissions` - Criar nova permissão
- `PATCH /permissions/:id` - Atualizar permissão
- `DELETE /permissions/:id` - Excluir permissão

#### Gerenciamento de Roles de Usuários

- `GET /users/:userId/roles` - Obter roles do usuário
- `POST /users/:userId/roles/:roleId` - Atribuir role ao usuário
- `DELETE /users/:userId/roles/:roleId` - Remover role do usuário
- `POST /users/:userId/roles/batch` - Definir múltiplas roles

### Guards e Decorators

```typescript
// Proteger endpoint com roles específicas
@Roles('super-admin', 'admin')
@UseGuards(JwtAuthGuard, RolesGuard)
async protectedEndpoint() {
  // Apenas super-admin e admin podem acessar
}

// Verificar permissão específica
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('users', 'create')
async createUser() {
  // Apenas usuários com permissão users.create podem acessar
}
```

## Migração e Setup

### 1. Executar Migrations

```sql
-- Migration 004 cria os níveis de acesso padrão
-- Executar: src/database/migrations/004-create-default-roles-and-permissions.sql
```

### 2. Criar Super Admin

```typescript
// Exemplo de criação de super admin
const superAdminRole = await roleService.findByName('super-admin');
await userRoleService.assignRoleToUser(userId, superAdminRole.id);
```

### 3. Verificar Permissões

```typescript
// Verificar se usuário tem permissão
const hasPermission = await authorizationService.hasPermission(
  userId,
  'users',
  'create',
);

// Verificar se usuário tem role
const hasRole = await authorizationService.hasRole(userId, 'admin');
```

## Segurança

### Boas Práticas

1. **Princípio do Menor Privilégio:** Sempre atribuir o mínimo de permissões necessárias
2. **Auditoria:** Todas as ações são registradas no sistema de auditoria
3. **Validação:** Verificar permissões tanto no frontend quanto no backend
4. **Sessões:** Tokens JWT com expiração e refresh tokens seguros
5. **Rate Limiting:** Implementar limitação de taxa para endpoints sensíveis

### Monitoramento

- Logs de auditoria para todas as ações de autorização
- Alertas para tentativas de acesso não autorizado
- Métricas de uso por nível de acesso
- Relatórios de permissões e roles

## Extensibilidade

O sistema foi projetado para ser facilmente extensível:

1. **Novos Recursos:** Adicionar novas entidades e permissões
2. **Novos Níveis:** Criar roles customizadas com permissões específicas
3. **Permissões Granulares:** Definir permissões por contexto ou região
4. **Hierarquia de Roles:** Implementar herança de permissões entre roles
5. **Permissões Temporárias:** Adicionar expiração para permissões específicas
