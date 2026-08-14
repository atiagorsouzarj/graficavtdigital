# ATUALIZAÇÕES v3.3.1 - Correções do Portal do Cliente (Login OTP + Banco)

**Data:** 2026-08-13
**Versão anterior:** 3.3.0 → **Nova versão:** 3.3.1
**Tema:** Banco de dados v3.3.0 + Login demo "123456" funcionando de verdade

---

## 🐛 Problemas Corrigidos

### 1. Erro "Failed query ... from quotes_orders where client_id = $1" (CRÍTICO)
**Sintoma:** Tela vermelha de erro no Painel de Controle → Portal do Cliente e em
qualquer página que listasse pedidos de um cliente.

**Causa:** O banco criado com o `create-tables.sql` antigo (16 tabelas) não tinha:
- 4 colunas novas em `quotes_orders` (`art_approval_token`, `art_approval_token_expires_at`, `tracking_token`, `tracking_token_expires_at`)
- 4 tabelas novas do portal (`client_otps`, `client_sessions`, `client_activity_log`, `gabaritos`)

**Correção:** Nova migração `migrations/v3.3.0-client-portal.sql` (idempotente — pode
rodar 2x sem erro). O `create-tables.sql` também foi atualizado para 20 tabelas.

### 2. Senha demo "123456" não passava da tela do token (CRÍTICO)
**Sintoma:** O painel promete *"a senha sempre é 123456"* em modo demo, mas ao digitar
o código na tela de verificação aparecia "Código expirado ou não encontrado" ou
"Código incorreto" — não passava do token.

**Causa:** O endpoint `verify-otp` não conhecia a senha demo. Só aceitava um OTP
pré-criado no banco pelo botão do painel (validade curta, e o "Reenviar código"
destruía o OTP demo).

**Correção:** `src/app/api/cliente/auth/verify-otp/route.ts` — quando o modo demo
está ATIVADO, o código `123456` é aceito diretamente para qualquer cliente cadastrado.
Com o modo demo DESATIVADO, `123456` é rejeitado normalmente (sem backdoor em produção).

### 3. Botão "Entrar com 123456" não abria nada
**Causa:** `window.open(_blank)` retornava `null` silenciosamente quando o navegador
bloqueava popup (comum em iframes/preview).

**Correção:** `src/components/ClientPortalSettings.tsx` — fallback para navegar na
mesma aba quando o popup é bloqueado.

### 4. Mensagem enganosa "Demo populado: 0 cliente(s) e 0 pedido(s)"
**Correção:** Agora exibe "Dados demo já existem no banco — nada precisou ser criado."
quando o seed não tem nada novo a criar (não era um erro).

### 5. Cookie de sessão em iframe/preview (opcional, para staging)
Adicionada variável de ambiente `CLIENT_COOKIE_SAMESITE`:
- Sem definir (padrão): `SameSite=lax` — comportamento original, recomendado em produção
- `CLIENT_COOKIE_SAMESITE=none`: para quando o app roda dentro de iframe cross-site
  (ambientes de preview/staging). **NÃO defina no servidor de produção.**

---

## 📦 Arquivos Alterados/Novos

```
MODIFICADOS:
  src/app/api/cliente/auth/verify-otp/route.ts   (senha demo 123456 + cookie configurável)
  src/components/ClientPortalSettings.tsx         (fallback popup + mensagem seed)
  create-tables.sql                               (20 tabelas — era 16)
  VERSION                                         (3.3.1)

NOVOS:
  migrations/v3.3.0-client-portal.sql             (migração para bancos existentes)
  INSTALAR-UPDATE-DB-v3.3.0.md                    (guia da migração de banco)
  ATUALIZACOES-v3.3.1.md                          (este arquivo)
```

**Nenhuma dependência foi adicionada ou removida. WhatsApp Baileys intacto:**
```bash
grep -c "makeWASocket" src/lib/whatsappService.ts
# retorna 6 ✅ (regra do README: deve ser 3+)
```

---

## 🚀 Como Atualizar o Servidor (procedimento padrão do README)

```bash
# 0. Backup (recomendado)
cd /www/wwwroot
cp -r erp-grafica erp-grafica-backup-v3.3.0
pg_dump -h 127.0.0.1 -U postgres -d app_db > backup-db-v3.3.0.sql

# 1. Upload do print-shop-erp-crm-system331.zip para o servidor

# 2. Extrair por cima da instalação
cd /www/wwwroot/erp-grafica
unzip -o print-shop-erp-crm-system331.zip

# 3. Aplicar a migração do banco  ⭐ OBRIGATÓRIO
psql -h 127.0.0.1 -U postgres -d app_db -f migrations/v3.3.0-client-portal.sql

# 4. Instalar dependências e compilar
npm install --legacy-peer-deps
npm run build

# 5. Reiniciar
pm2 restart print-shop-erp

# 6. Verificar
curl http://localhost:3000/api/health          # → {"ok":true}
grep -c "makeWASocket" src/lib/whatsappService.ts   # → 3+
```

---

## ✅ Checklist de Validação Pós-Update

- [ ] `curl http://localhost:3000/api/health` retorna `{"ok":true}`
- [ ] Painel → Portal do Cliente abre **sem** o erro vermelho "Failed query"
- [ ] "Popular Banco com Dados Demo" cria/reconhece os 3 clientes demo
- [ ] Com modo demo ATIVADO: login em `/cliente/login` com CPF demo + código `123456` entra no dashboard
- [ ] Com modo demo DESATIVADO: `123456` é rejeitado (segurança)
- [ ] Fluxo OTP real por e-mail continua funcionando
- [ ] WhatsApp: `grep -c "makeWASocket" src/lib/whatsappService.ts` retorna 3+

---

## ⚠️ Sobre o loop de login em ambientes de preview/iframe

Se o portal do cliente for acessado através de um iframe em outro domínio (ex.:
ambientes de staging/preview), o navegador pode descartar o cookie de sessão
(`SameSite=lax`) e o login volta para a tela do token em loop.

**No servidor de produção normal (app.vtdigital.site, acessado direto no navegador)
isso NÃO acontece** — o cookie é primeira parte e funciona com a configuração padrão.

Se precisar rodar dentro de iframe, adicione ao `.env.local`:
```
CLIENT_COOKIE_SAMESITE=none
```
