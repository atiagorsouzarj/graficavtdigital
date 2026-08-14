# ATUALIZAÇÕES v3.3.4 - Novo Design do Portal do Cliente + Jornada do Pedido

**Data:** 2026-08-13
**Versão anterior:** 3.3.3 → **Nova versão:** 3.3.4
**Tema:** Redesign do painel do cliente com step-by-step "Do Orçamento à Entrega"

> Versão CUMULATIVA: inclui v3.3.1 (migração DB + senha demo), v3.3.2 (SMTP pelo
> painel + instalador) e v3.3.3 (e-mail transacional real).

---

## ✨ Novidades

### 1. Jornada do Pedido — Step by Step (novo componente `OrderJourneyStepper`)
Linha de progresso visual em **7 etapas**, refletindo o fluxo REAL do sistema
(Kanban de produção + aprovação de arte + pagamento):

```
1. Orçamento  →  2. Aprovação de Arte  →  3. Pagamento  →  4. Impressão
→  5. Acabamento  →  6. Pronto  →  7. Entregue
```

- **Desktop:** stepper horizontal com linha de progresso gradiente, ícones por
  etapa (arquivo, paleta, cartão, impressora, tesoura, pacote, festa)
- **Mobile:** timeline vertical com badges "✓ CONCLUÍDO" e "ETAPA ATUAL"
- **Etapa atual pulsa** (animate-ping) para chamar atenção
- Pedido cancelado exibe aviso próprio
- Mapeamento inteligente dos status do Kanban:
  - `draft/sent` → Orçamento
  - `art_approval/art_pending` → Aprovação de Arte
  - arte aprovada sem pagamento → Pagamento
  - `production_ready/in_printing` → Impressão
  - `finishing` → Acabamento
  - `ready_for_pickup` → Pronto
  - `completed` → Entregue

### 2. Onde a jornada aparece
- **Dashboard (`/cliente/dashboard`):** novo card "Pedido em andamento" com o
  stepper completo do pedido ativo mais recente
- **Detalhe do pedido (`/cliente/pedidos/[id]`):** substitui a antiga lista
  "Linha do tempo" pelo card "Acompanhe seu pedido — do orçamento à entrega"
- **Cards de listagem (dashboard + /cliente/pedidos):** mini barra de progresso
  "ETAPA X DE 7" com gradiente (azul em andamento, verde quando entregue)

### 3. Polimento visual (mantendo a identidade do sistema)
- Fundo da área do cliente com gradiente suave (slate → sky → indigo)
- Avatar do cliente com gradiente sky→indigo e borda
- Link **Gabaritos** adicionado ao menu (a página existia mas não era acessível!)
- Hover melhorado nos cards (borda azul + sombra + seta desliza)

---

## 📦 Arquivos Alterados/Novos nesta versão

```
NOVOS:
  src/components/OrderJourneyStepper.tsx     (jornada do pedido, 7 etapas)
  ATUALIZACOES-v3.3.4.md                     (este arquivo)

MODIFICADOS:
  src/app/cliente/dashboard/page.tsx          (card jornada + barras compactas)
  src/app/cliente/pedidos/page.tsx            (barras de progresso nos cards)
  src/app/cliente/pedidos/[id]/page.tsx       (stepper no lugar da timeline antiga)
  src/components/ClientAreaLayout.tsx         (gradiente, avatar, menu Gabaritos)
  VERSION                                     (3.3.4)
```

**Sem mudanças de banco de dados nesta versão.**
**WhatsApp Baileys intacto:** `grep -c "makeWASocket"` = 6 ✅

---

## 🚀 INSTALAÇÃO (automática)

```bash
cd /www/wwwroot/erp-grafica
unzip -o print-shop-erp-crm-system334.zip
chmod +x instalar-update.sh
./instalar-update.sh
```
Depois: **Purge Everything** no Cloudflare.

---

## ✅ Checklist Pós-Instalação

- [ ] Dashboard do cliente mostra o card "Pedido em andamento" com o stepper
- [ ] Detalhe do pedido mostra "Acompanhe seu pedido" (desktop horizontal / mobile vertical)
- [ ] Cards de pedidos mostram "ETAPA X DE 7" com barra de progresso
- [ ] Menu tem o link "Gabaritos"
- [ ] Pedido concluído → barra verde "ETAPA 7 DE 7 / ENTREGUE"
