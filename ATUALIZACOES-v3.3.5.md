# ATUALIZAÇÕES v3.3.5 - Dashboard do Cliente Profissional + Preview de E-mail Real

**Data:** 2026-08-13
**Versão anterior:** 3.3.4 → **Nova versão:** 3.3.5
**Tema:** Repaginação do dashboard do cliente + preview de templates com dados de exemplo

> Versão CUMULATIVA: inclui v3.3.1 → v3.3.4 (migração DB, senha demo, SMTP painel,
> e-mail transacional real, jornada do pedido).

---

## ✨ Novidades

### 1. Dashboard do Cliente repaginado (`/cliente/dashboard`)
- **Hero premium:** gradiente escuro slate→sky→indigo com brilhos decorativos,
  badge "Área exclusiva do cliente" e saudação por horário (Bom dia/Boa tarde/Boa noite)
- **Alerta de arte pendente em destaque:** banner âmbar com ícone pulsando e botão
  "Aprovar Agora" — a ação mais importante fica impossível de ignorar
- **KPIs redesenhados:** cards com ícone em badge colorido, hover com elevação
  ("Em Produção", "Concluídos", "A Pagar", "Total Investido")
- **Coluna "Ações rápidas":**
  - Novo Orçamento (CTA verde → WhatsApp da gráfica)
  - Gabaritos (modelos para download)
  - Meus Dados
  - Card de Suporte (dark) com link direto para atendente
- Estado vazio com CTA "Pedir orçamento" pelo WhatsApp

### 2. Preview do E-mail Transacional com dados de exemplo (`/email-templates`)
- As variáveis agora são renderizadas no preview como o cliente verá:
  `{{nome_cliente}}` → **Maria Silva**, `{{codigo_pedido}}` → **PED-000102**,
  `{{valor_total}}` → **R$ 250,00**
- Corpo HTML (ex.: template `email_quote_sent`) renderiza como HTML real no preview
- Legenda indicando os dados de exemplo usados

---

## 📦 Arquivos Alterados nesta versão

```
MODIFICADOS:
  src/app/cliente/dashboard/page.tsx     (redesign completo)
  src/app/email-templates/page.tsx        (preview com variáveis renderizadas)
  VERSION                                 (3.3.5)
```

**Sem mudanças de banco.** WhatsApp Baileys intacto (makeWASocket = 6) ✅

---

## 🚀 INSTALAÇÃO (automática)

```bash
cd /www/wwwroot/erp-grafica
unzip -o print-shop-erp-crm-system335.zip
chmod +x instalar-update.sh
./instalar-update.sh
```
Depois: **Purge Everything** no Cloudflare.
