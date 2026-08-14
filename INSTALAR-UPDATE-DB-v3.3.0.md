# 🔧 UPDATE: Correção do Banco de Dados - Portal do Cliente v3.3.0

## O Problema que este update corrige

```
Error: Failed query: select "id", "code", ... "art_approval_token",
"tracking_token", ... from "quotes_orders" where "client_id" = $1
```

**Causa:** O banco de dados foi criado com o `create-tables.sql` antigo (16 tabelas),
mas o código v3.3.0 espera 20 tabelas + 4 colunas novas em `quotes_orders`.

**Este update NÃO altera nenhum código.** Só o banco de dados.
O WhatsApp Baileys não é tocado (`grep -c "makeWASocket"` continua 3+).

---

## 📦 Arquivos deste pacote

| Arquivo | O que é |
|---|---|
| `migrations/v3.3.0-client-portal.sql` | ⭐ Migração para bancos EXISTENTES (idempotente, roda 2x sem erro) |
| `create-tables.sql` | Versão atualizada (20 tabelas) — para instalações NOVAS |
| `INSTALAR-UPDATE-DB-v3.3.0.md` | Este guia |

---

## 🚀 Instalação em servidor com banco EXISTENTE (seu caso)

```bash
# 1. Vá para a pasta do sistema
cd /www/wwwroot/erp-grafica     # ajuste para o seu caminho

# 2. Extraia o pacote (sobrescreve create-tables.sql e cria migrations/)
unzip -o update-db-v3.3.0.zip

# 3. (Opcional, recomendado) Backup do banco
pg_dump -h 127.0.0.1 -U postgres -d app_db > backup-antes-v3.3.0.sql

# 4. Aplique a migração  ⭐ PASSO PRINCIPAL
psql -h 127.0.0.1 -U postgres -d app_db -f migrations/v3.3.0-client-portal.sql

# 5. Reinicie a aplicação
pm2 restart print-shop-erp
```

> 💡 Se o seu banco/usuário for diferente (ex.: `grafica_db` / `grafica_user`),
> ajuste o comando: `psql -h 127.0.0.1 -U grafica_user -d grafica_db -f migrations/v3.3.0-client-portal.sql`

### Alternativa sem o ZIP (só o SQL)
Se preferir, copie apenas o arquivo `migrations/v3.3.0-client-portal.sql` para o
servidor (scp, FTP, ou colar no psql) e execute o passo 4. É o único passo obrigatório.

### Alternativa via Drizzle (se tiver o repositório no servidor)
```bash
npx drizzle-kit push    # sincroniza o schema.ts direto com o banco
pm2 restart print-shop-erp
```

---

## ✅ Validação pós-instalação

```bash
# 1. As 4 colunas novas devem aparecer:
psql -h 127.0.0.1 -U postgres -d app_db -c \
  "SELECT column_name FROM information_schema.columns
   WHERE table_name='quotes_orders' AND column_name LIKE '%token%';"
# Esperado: art_approval_token, art_approval_token_expires_at,
#           tracking_token, tracking_token_expires_at

# 2. As 4 tabelas novas devem existir:
psql -h 127.0.0.1 -U postgres -d app_db -c \
  "SELECT tablename FROM pg_tables WHERE schemaname='public'
   AND tablename IN ('client_otps','client_sessions','client_activity_log','gabaritos');"

# 3. Health check:
curl http://localhost:3000/api/health
# Esperado: {"ok":true}

# 4. Verificação obrigatória do WhatsApp (regra do README):
grep -c "makeWASocket" src/lib/whatsappService.ts
# Esperado: 3 ou mais
```

Depois teste na interface: **Configurações → Portal do Cliente → Entrar com 123456**
— o erro vermelho não deve mais aparecer.

---

## 🆕 Instalação do ZERO (banco novo)

Use o `create-tables.sql` atualizado deste pacote (já cria as 20 tabelas):
```bash
psql -h 127.0.0.1 -U postgres -d app_db -f create-tables.sql
```

---

## 📋 O que a migração cria (resumo técnico)

**Colunas novas em `quotes_orders`:**
- `art_approval_token` / `art_approval_token_expires_at` — link público de aprovação de arte
- `tracking_token` / `tracking_token_expires_at` — link público de rastreio

**Tabelas novas:**
- `client_otps` — códigos OTP de login do cliente
- `client_sessions` — sessões do portal do cliente
- `client_activity_log` — auditoria de ações
- `gabaritos` — galeria de templates

**Índices:** `client_otps(client_id)`, `client_sessions(client_id)`,
`client_activity_log(client_id)`, `quotes_orders(client_id)`

---

Data: 2026-08-13 · Versão alvo: v3.3.0 · Alteração: somente banco de dados
