# ATUALIZAÇÕES v3.3.2 - E-mail SMTP Real + Instalador Automático

**Data:** 2026-08-13
**Versão anterior:** 3.3.1 → **Nova versão:** 3.3.2
**Tema:** OTP por e-mail real (SMTP configurável pelo painel) + instalação em 1 comando

> Esta versão INCLUI tudo da v3.3.1 (migração do banco do Portal do Cliente,
> senha demo 123456, correções do painel). Se seu servidor ainda está na v3.3.0,
> pode pular direto para esta — o instalador aplica tudo.

---

## ✨ Novidades

### 1. Envio de e-mail REAL (nodemailer incluído)
- `nodemailer` agora faz parte do `package.json` (antes o envio SMTP nunca
  funcionaria pois o pacote não existia).
- Sem SMTP configurado, o comportamento antigo continua: e-mail vai para o log
  do sistema (modo dev/demo) e o cliente NÃO recebe.

### 2. SMTP configurável PELO PAINEL (sem mexer em .env)
- `/configuracoes` → **Portal do Cliente** → **E-mail do Portal (SMTP)**
- Campos novos: Host, Porta, STARTTLS/SSL, Usuário, Senha (Senha de App), Remetente
- **Prioridade:** configurações do painel > variáveis de ambiente (`SMTP_HOST`,
  `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`)
- As configurações ficam salvas no banco (`system_settings`, chaves `client_portal_smtp_*`)

### 3. Botão "Enviar e-mail de teste"
- No mesmo painel: digite seu e-mail e clique — valida a conexão SMTP e envia um
  e-mail de verdade na hora, com mensagens de erro claras se algo estiver errado.
- Endpoint novo: `GET/POST /api/admin/client-portal/smtp-test`

### 4. Instalador automático (`instalar-update.sh`)
Um comando faz TUDO: backup do banco → migração → dependências → verificação
do WhatsApp (makeWASocket 3+) → build limpo → restart PM2 → validação
(health check + teste do CSS para evitar o problema do build corrompido).

---

## 🚀 INSTALAÇÃO AUTOMÁTICA (recomendada)

```bash
cd /www/wwwroot/erp-grafica          # pasta do sistema
unzip -o print-shop-erp-crm-system332.zip
chmod +x instalar-update.sh
./instalar-update.sh
```

O script pergunta antes de qualquer passo arriscado e aborta com mensagem clara
se algo falhar (disco cheio, migração, WhatsApp adulterado, etc).

Variáveis opcionais (se seu ambiente for diferente do padrão):
```bash
DB_HOST=127.0.0.1 DB_USER=postgres DB_NAME=app_db PM2_APP=print-shop-erp ./instalar-update.sh
```

### Instalação manual (se preferir)
```bash
cd /www/wwwroot/erp-grafica
unzip -o print-shop-erp-crm-system332.zip
psql -h 127.0.0.1 -U postgres -d app_db -f migrations/v3.3.0-client-portal.sql
npm install --legacy-peer-deps
pm2 stop print-shop-erp && rm -rf .next && npm run build
pm2 restart print-shop-erp --update-env
```

**Depois (qualquer método):** Cloudflare → Caching → **Purge Everything**

---

## 📧 Configurando o e-mail (depois de instalar)

1. Abra `/configuracoes` → aba **Portal do Cliente**
2. Na seção **E-mail do Portal (SMTP)** preencha:

   | Provedor | Host | Porta | Conexão |
   |---|---|---|---|
   | Gmail | smtp.gmail.com | 587 | STARTTLS |
   | Hostinger | smtp.hostinger.com | 465 | SSL/TLS |
   | Zoho | smtp.zoho.com | 465 | SSL/TLS |
   | Outlook/365 | smtp.office365.com | 587 | STARTTLS |

   - **Gmail:** a senha é uma **Senha de App** (myaccount.google.com → Segurança →
     Verificação em 2 etapas → Senhas de app), NÃO a senha normal da conta.
3. Digite seu e-mail no campo de teste e clique **"Enviar e-mail de teste"**
4. Chegou na caixa de entrada? Pronto. **Desative o Modo Demo.**
5. Teste real: `/cliente/login` → CPF de um cliente com e-mail cadastrado →
   o código de 6 dígitos chega por e-mail → login funciona.

---

## 📦 Arquivos Alterados/Novos nesta versão

```
MODIFICADOS:
  src/lib/emailSender.ts                          (lê config do painel + verifySmtpConnection)
  src/components/ClientPortalSettings.tsx          (campos SMTP completos + botão de teste)
  package.json / package-lock.json                 (+ nodemailer)
  VERSION                                          (3.3.2)

NOVOS:
  src/app/api/admin/client-portal/smtp-test/route.ts  (endpoint de teste SMTP)
  instalar-update.sh                                   (instalador automático)
  ATUALIZACOES-v3.3.2.md                               (este arquivo)

HERDADOS DA v3.3.1 (inclusos):
  migrations/v3.3.0-client-portal.sql
  src/app/api/cliente/auth/verify-otp/route.ts (senha demo 123456)
  create-tables.sql (20 tabelas)
```

**WhatsApp Baileys intacto:** `grep -c "makeWASocket" src/lib/whatsappService.ts` = 6 ✅
(o instalador verifica isso automaticamente e aborta se < 3)

---

## ✅ Checklist Pós-Instalação

- [ ] `./instalar-update.sh` terminou com "🎉 ATUALIZAÇÃO CONCLUÍDA"
- [ ] Purge Everything no Cloudflare
- [ ] SMTP configurado no painel + e-mail de teste recebido
- [ ] Modo Demo DESATIVADO
- [ ] Login real com OTP por e-mail funcionando
- [ ] `curl http://localhost:3000/api/health` → `{"ok":true}`
