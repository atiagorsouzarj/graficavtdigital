# ATUALIZAÇÕES v3.3.3 - E-mail Transacional REAL (Módulo Unificado)

**Data:** 2026-08-13
**Versão anterior:** 3.3.2 → **Nova versão:** 3.3.3
**Tema:** Módulo de E-mail Transacional deixou de ser simulado — agora envia de verdade

> Esta versão é CUMULATIVA: inclui v3.3.1 (migração DB + senha demo) e
> v3.3.2 (nodemailer + SMTP pelo painel + instalador automático).

---

## 🐛 O que estava errado (auditoria do módulo E-mail Transacional)

1. **Botão "Testar Disparo" (`/email-templates`) era FAKE:** um `setTimeout` de 1,5s
   no frontend mostrava "E-mail disparado com sucesso via Servidor SMTP!" sem chamar
   API nenhuma. Nenhum e-mail jamais foi enviado.
2. **API `/api/email` era FAKE:** validava o destinatário e respondia
   `"status": "delivered"` com messageId inventado — sem enviar nada.
3. **Não existia botão Salvar:** o editor de templates tinha os campos, mas as
   edições nunca eram persistidas (o backend PUT /api/templates existia, mas a
   página não o chamava).
4. **Templates órfãos:** os templates de e-mail do banco (`email_quote_sent` etc.)
   não eram usados por nenhum envio real.

## ✅ O que foi feito

### 1. `/api/email` agora envia DE VERDADE
Usa o mesmo motor SMTP do Portal do Cliente (`lib/emailSender`):
configuração do painel (`client_portal_smtp_*`) ou variáveis de ambiente.
**Um único módulo de e-mail para o sistema inteiro** — OTP + transacionais.

Dois modos de uso:
```bash
# a) Por template salvo no banco (com variáveis dinâmicas):
curl -X POST /api/email -d '{
  "to": "cliente@dominio.com",
  "templateCode": "email_quote_sent",
  "variables": { "nome_cliente": "Maria", "codigo_pedido": "PED-77",
                 "valor_total": "R$ 300,00", "link_aprovacao": "https://..." }
}'

# b) Conteúdo direto (usado pelo botão Testar Disparo):
curl -X POST /api/email -d '{ "to": "x@y.com", "subject": "...", "body": "..." }'
```

**Honestidade:** sem SMTP configurado, responde `status: "logged_only"` com HTTP 502
e mensagem clara — nunca mais finge entrega.

### 2. Novo motor de renderização (`lib/emailTemplates.ts`)
- Substitui variáveis `{{nome_cliente}}`, `{{codigo_pedido}}`, `{{valor_total}}`,
  `{{link_aprovacao}}` + automáticas `{{empresa_nome}}`, `{{empresa_telefone}}`,
  `{{empresa_whatsapp}}`, `{{empresa_email}}`
- Aplica o layout HTML corporativo (mesmo visual do preview da página) com os
  dados REAIS da empresa vindos do Painel de Controle (system_settings)
- CTA "Acessar Portal do Cliente" automático quando há `{{link_aprovacao}}`

### 3. Página `/email-templates` funcional
- **"Testar Disparo"** agora chama `/api/email` e envia o conteúdo do editor por
  SMTP real; erro aparece em toast vermelho com instrução do que configurar
- **Novo botão "Salvar Template"** persiste título/assunto/corpo no banco
- Toasts diferenciados: enviado (verde) / salvo (azul) / erro (vermelho)

---

## 📦 Arquivos Alterados/Novos nesta versão

```
NOVOS:
  src/lib/emailTemplates.ts                (renderização: variáveis + layout corporativo)
  ATUALIZACOES-v3.3.3.md                   (este arquivo)

MODIFICADOS:
  src/app/api/email/route.ts               (envio real via emailSender — era fake)
  src/app/email-templates/page.tsx          (Testar Disparo real + botão Salvar)
  VERSION                                   (3.3.3)

HERDADOS (v3.3.1 + v3.3.2, inclusos no pacote):
  migrations/v3.3.0-client-portal.sql
  src/lib/emailSender.ts (SMTP painel/env)
  src/app/api/admin/client-portal/smtp-test/route.ts
  src/components/ClientPortalSettings.tsx (painel SMTP + teste)
  src/app/api/cliente/auth/verify-otp/route.ts (senha demo)
  package.json (+nodemailer) / create-tables.sql (20 tabelas)
  instalar-update.sh (instalador automático)
```

**WhatsApp Baileys intacto:** `grep -c "makeWASocket" src/lib/whatsappService.ts` = 6 ✅

---

## 🚀 INSTALAÇÃO (mesma da v3.3.2 — automática)

```bash
cd /www/wwwroot/erp-grafica
unzip -o print-shop-erp-crm-system333.zip
chmod +x instalar-update.sh
./instalar-update.sh
```
Depois: **Purge Everything** no Cloudflare.

---

## 🧪 Testes Realizados (com servidor SMTP real de laboratório)

| Teste | Resultado |
|---|---|
| `/api/email` com template `email_quote_sent` + variáveis | ✅ enviado via SMTP, assunto renderizado "Orçamento PED-2026-77 - VTDIGITAL ART STUDIO" |
| E-mail chegou no servidor SMTP (from/to/subject conferidos) | ✅ |
| OTP do portal pelo MESMO SMTP configurado no painel | ✅ `mode: "smtp"` |
| Sem SMTP: resposta honesta `logged_only` (não finge entrega) | ✅ |
| Template inexistente | ✅ 404 |
| UI: botões Salvar/Testar renderizam; erro honesto em toast | ✅ |
| Build de produção | ✅ sem erros |

---

## ✅ Checklist Pós-Instalação

- [ ] `./instalar-update.sh` concluiu com sucesso
- [ ] SMTP configurado no painel (Portal do Cliente → E-mail do Portal)
- [ ] `/email-templates` → "Testar Disparo" → e-mail chegou na caixa de entrada
- [ ] Editar um template → "Salvar Template" → recarregar página → edição persistiu
- [ ] OTP do portal chegando por e-mail
- [ ] Modo Demo desativado em produção
