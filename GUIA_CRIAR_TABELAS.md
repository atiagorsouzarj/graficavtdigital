# Guia: Criação Manual das Tabelas PostgreSQL

**Problema:** O comando `npx drizzle-kit push` requer entrada interativa e não pode ser automatizado. As tabelas do banco de dados não foram criadas automaticamente.

**Solução:** Execute o script SQL gerado automaticamente (`create-tables.sql`) diretamente no PostgreSQL.

---

## 📋 Pré-requisitos

- PostgreSQL 15+ instalado e rodando
- Base de dados `app_db` já criada
- Usuário `postgres` ou equivalente com privilégios de administrador
- Arquivo `create-tables.sql` presente no diretório do projeto

---

## 🚀 Opção 1: Executar via Linha de Comando (Recomendado)

### 1.1 Acessar o Servidor Debian

Se estiver conectado remotamente:
```bash
ssh root@SEU_IP_SERVIDOR
cd /www/wwwroot/erp-grafica
```

### 1.2 Executar o Script SQL

```bash
psql -U postgres -d app_db -f create-tables.sql
```

**Esperado:** Saída sem erros com `CREATE TABLE` confirmações:
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
CREATE INDEX
CREATE INDEX
```

### 1.3 Verificar se Tabelas Foram Criadas

```bash
psql -U postgres -d app_db -c "SELECT * FROM information_schema.tables WHERE table_schema = 'print_shop';"
```

Deverá listar as 16 tabelas criadas.

---

## 🖥️ Opção 2: Executar via psql (Passo a Passo)

Se preferir copiar e colar manualmente:

### 2.1 Acessar o PostgreSQL

```bash
psql -U postgres -d app_db
```

### 2.2 Copiar e Colar o Conteúdo do SQL

Abra o arquivo `create-tables.sql`, copie TODO o conteúdo e cole dentro da sessão psql:

```sql
-- Cole aqui TODO o conteúdo de create-tables.sql
-- Pressione Enter para executar
```

### 2.3 Sair do psql

```
\q
```

---

## ✅ Verificação Pós-Instalação

Após criar as tabelas, teste a conexão do ERP:

### 3.1 Inicie o Servidor (se ainda não estiver rodando)

```bash
cd /www/wwwroot/erp-grafica
npm run build
pm2 start npm --name "erp-grafica" -- start
```

### 3.2 Teste o Endpoint de WhatsApp

```bash
curl http://localhost:3000/api/whatsapp
```

**Antes (sem tabelas):**
```json
{
  "error": "Failed query: select..."
}
```

**Depois (com tabelas):**
```json
{
  "success": true,
  "instance_name": "Gráfica Baileys Principal",
  "status": "connected",
  "qr_code_url": null
}
```

### 3.3 Verifique Saúde da API

```bash
curl http://localhost:3000/api/health
```

Deverá retornar:
```json
{"ok": true}
```

---

## 🔧 Solução de Problemas

### Erro: "FATAL: database \"app_db\" does not exist"

**Solução:** Crie a base de dados primeiro:
```bash
psql -U postgres -c "CREATE DATABASE app_db;"
```

### Erro: "role \"postgres\" does not exist"

**Solução:** Use o superusuário padrão (geralmente `postgres`):
```bash
psql -U postgres -d app_db -f create-tables.sql
```

### Erro: "permission denied for schema public"

**Solução:** Verifique permissões do usuário:
```bash
psql -U postgres -d app_db -c "GRANT ALL ON SCHEMA print_shop TO postgres;"
```

### Erro: "syntax error" ao copiar e colar

**Motivo:** Alguns terminais cortam linhas grandes. Use a **Opção 1** (linha de comando) em vez de copiar/colar.

### Erro: "relation \"users\" already exists"

**Motivo:** Tabelas já foram criadas. Se quiser recriá-las:
```bash
# AVISO: Isso apagará TODOS os dados!
psql -U postgres -d app_db -c "DROP SCHEMA print_shop CASCADE;"
psql -U postgres -d app_db -f create-tables.sql
```

---

## 📊 Tabelas Criadas

Após executar com sucesso, as seguintes 16 tabelas estarão disponíveis:

| # | Tabela | Descrição |
|---|--------|-----------|
| 1 | `users` | Operadores e funcionários do ERP |
| 2 | `clients` | Clientes (PF e PJ) com CRM completo |
| 3 | `printer_categories` | Categorias de impressoras (Laser, Jato, Sublimação, Térmica) |
| 4 | `printers` | Máquinas/equipamentos com cálculos de insumo |
| 5 | `materials` | Materiais, papéis e insumos com estoque |
| 6 | `finishes` | Acabamentos e serviços adicionais |
| 7 | `products` | Produtos com ficha técnica (BOM) e preço dinâmico |
| 8 | `quotes_orders` | Orçamentos e pedidos unificados |
| 9 | `quote_order_items` | Itens individuais de cada orçamento/pedido |
| 10 | `financial_accounts` | Contas bancárias e caixas |
| 11 | `financial_transactions` | Movimentações financeiras (entrada/saída) |
| 12 | `pdv_shifts` | Turnos de caixa (abertura/fechamento) |
| 13 | `system_settings` | Configurações gerais do sistema |
| 14 | `communication_templates` | Modelos de mensagens (WhatsApp, e-mail) |
| 15 | `whatsapp_config` | Configuração Baileys (QR Code, status de conexão) |
| 16 | `api_keys` | Chaves para APIs externas |

---

## 🎯 Próximas Etapas

Após criar as tabelas:

1. **Popular dados iniciais:** Execute o seed `npm run seed` (se disponível)
2. **Testar WhatsApp:** Acesse `/api/whatsapp` e escaneie o QR Code com WhatsApp
3. **Verificar Dashboard:** Acesse `http://seu-dominio.com.br` no navegador
4. **Criar primeiro cliente:** Vá em **CRM > Clientes** e adicione um cliente teste

---

## 📞 Suporte

Se encontrar erro não listado acima:

1. Verifique logs do PostgreSQL: `tail -f /var/log/postgresql/postgresql.log`
2. Teste conexão do .env: `echo $DATABASE_URL`
3. Verifique permissões: `ls -la create-tables.sql`
4. Consulte a documentação completa: `DEBIAN_DEPLOYMENT.md`

---

**Última atualização:** 2026-08-10  
**Versão ERP:** v2.5.0+
