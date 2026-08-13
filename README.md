# PrintFlow ERP v2.8.0
**Sistema de Gestão Integrado para Gráficas Rápidas + CRM + PDV + WhatsApp Baileys**

---

## 🚀 Começar Rápido

### Pré-requisitos
- **Node.js** 18+ e npm
- **PostgreSQL** 15+
- **Git** para versionamento

### Instalação Local
```bash
# 1. Clone e entre no diretório
git clone https://github.com/atiagorsouzarj/graficavtdigital.git
cd graficavtdigital

# 2. Instale dependências
npm install --legacy-peer-deps
npm install @whiskeysockets/baileys sharp jimp

# 3. Configure variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com:
# DATABASE_URL=postgresql://user:password@localhost:5432/app_db

# 4. Build e inicie
npm run build
npm run dev
```

Acesse em: **http://localhost:3000**

---

## 📦 Dependências Críticas

⚠️ **NUNCA REMOVA:**
```json
{
  "@whiskeysockets/baileys": "^6.7.0",     // WhatsApp real via WebSockets
  "drizzle-orm": "^0.28.0",                // ORM TypeScript para PostgreSQL
  "next": "^16.2.6",                       // Framework React/Node
  "sharp": "^0.33.0",                      // Processamento de imagens
  "jimp": "^0.22.0",                       // Manipulação de imagens
  "qrcode": "^1.5.3",                      // Geração de QR codes
  "pg": "^8.11.0"                          // Cliente PostgreSQL
}
```

---

## 🔐 WhatsApp Baileys (CRÍTICO)

### ⚠️ Regra de Ouro
**O WhatsApp DEVE usar `makeWASocket` do Baileys REAL, NÃO simulado.**

❌ **NUNCA FAÇA:**
```typescript
// ERRADO - Simulado
const qrDataPayload = `2@A82K_${timestamp}_SIMULADO`;
const qrCodeUrl = await QRCode.toDataURL(qrDataPayload);
```

✅ **SEMPRE USE:**
```typescript
// CORRETO - Baileys Real
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';

const { state, saveCreds } = await useMultiFileAuthState('.wh-auth');
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true,
  browser: ['PrintFlow ERP', 'Chrome', '120.0'],
});

sock.ev.on('connection.update', (update) => {
  const { qr } = update;
  if (qr) {
    const qrCodeUrl = await QRCode.toDataURL(qr); // QR real do Baileys
  }
});
```

### ⚠️ **AVISO CRÍTICO - PROGRAMADORES LEIA AGORA**

**❌ NÃO MUDE O WHATSAPP SEM COMUNICAR AO LEAD DE DESENVOLVIMENTO**

Se você mudar qualquer coisa no WhatsApp:
1. **VOCÊ QUEBRA O SISTEMA** - O bot deixa de funcionar
2. **VOCÊ NÃO PODE ENVIAR** para produção sem aprovação
3. **SE MUDAR, DEVE ADAPTAR** exatamente para a forma que Claude desenvolveu:
   - Usar `makeWASocket` (não QR code simulado)
   - Implementar `useMultiFileAuthState` (autenticação em `.wh-auth/`)
   - Adicionar `messages.upsert` listener (bot automático)
   - Implementar `antiBanDelay` (1.5s-3.5s entre mensagens)
   - Configurar `sendPresenceUpdate` (aparentar estar digitando)

**Se você receber um PR/ZIP com WhatsApp mudado:**
- Verificar SEMPRE com: `grep -c "makeWASocket" src/lib/whatsappService.ts`
- Se retornar 0: **REJEITAR** o código
- Se retornar 3+: **ACEITAR** e fazer deploy

**O sistema vai verificar TODA vez que atualizar:**
```bash
# Este check é OBRIGATÓRIO antes de produção
grep -c "makeWASocket" src/lib/whatsappService.ts
# ✅ Deve retornar: 3 ou mais
# ❌ Se retornar 0: FALHA CRÍTICA - NÃO ENVIAR PARA PRODUÇÃO
```

---

### Verificação
Sempre verifique se o arquivo `src/lib/whatsappService.ts` contém:
```bash
grep -c "makeWASocket" src/lib/whatsappService.ts
# Deve retornar 3 ou mais
```

### Configuração em Produção
- Arquivo de autenticação: `.wh-auth/` (NÃO versione no git)
- QR Code aguarda pareamento real com WhatsApp Web
- Bot responde automaticamente via listener `messages.upsert`
- Anti-ban delay: 1.5s a 3.5s entre mensagens

---

## 🏗️ Arquitetura

### Stack Tecnológico
```
Next.js 16 (App Router, TypeScript)
├── Frontend: React 19 + Tailwind CSS
├── Backend: Node.js API Routes
├── Database: PostgreSQL 15 + Drizzle ORM
├── WhatsApp: Baileys v6.7.0 (WebSockets)
├── Processamento: Sharp + Jimp
└── Deploy: PM2 + Nginx + Cloudflare Tunnel
```

### Estrutura de Pastas
```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # Endpoints da API
│   │   ├── whatsapp/      # WhatsApp Bot
│   │   ├── orders/        # Pedidos/Orçamentos
│   │   ├── clients/       # CRM Clientes
│   │   └── ...
│   ├── whatsapp/          # Página de Live Chat
│   ├── kanban/            # Quadro de Produção
│   ├── pdv/               # Ponto de Venda
│   ├── produtos/          # Catálogo de Produtos
│   └── ...
├── components/            # Componentes React
├── db/
│   ├── schema.ts          # 16 tabelas Drizzle
│   ├── seed.ts            # Dados iniciais
│   └── index.ts           # Conexão PostgreSQL
├── lib/
│   ├── whatsappService.ts # Bot + Baileys [CRÍTICO]
│   ├── productPricingEngine.ts
│   └── ...
└── styles/
```

### Banco de Dados (16 Tabelas)
```sql
-- CRM
users, clients

-- Produtos & Preços
products, materials, finishes, printer_categories, printers

-- Pedidos
quotes_orders, quote_order_items

-- Financeiro
financial_accounts, financial_transactions, pdv_shifts

-- WhatsApp & Comunicação
whatsapp_config, communication_templates, api_keys

-- Sistema
system_settings
```

Crie as tabelas com:
```bash
psql -h 127.0.0.1 -U postgres -d app_db < create-tables.sql
```

---

## 🛠️ Desenvolvimento - REGRAS CRÍTICAS

### ✅ O Que Você PODE Fazer
- Adicionar novas páginas/rotas
- Criar novos endpoints API
- Adicionar campos ao banco (migrações)
- Melhorar UI/UX
- Optimizar performance

### ❌ O Que NUNCA FAÇA
1. **Remover ou renomear dependências críticas** (Baileys, Drizzle, Next, Sharp)
2. **Usar WhatsApp simulado** - sempre use `makeWASocket`
3. **Commitar arquivos sensíveis** (.env.local, .wh-auth/, node_modules)
4. **Alterar a estrutura do banco sem migrations**
5. **Remover listeners de WhatsApp** (messages.upsert)
6. **Desabilitar PM2 em produção**

### 📋 Checklist Antes de Fazer Commit
```bash
# 1. Verifique WhatsApp
grep -c "makeWASocket" src/lib/whatsappService.ts

# 2. Teste localmente
npm run build
npm run dev

# 3. Verifique dependências
npm list @whiskeysockets/baileys sharp jimp

# 4. Não commite sensíveis
git status | grep -E ".env|.wh-auth|node_modules"

# 5. Commit apenas mudanças relevantes
git add <arquivos-modificados>
git commit -m "Descrição clara da mudança"
git push origin main
```

---

## 📱 WhatsApp Bot - Como Funciona

### Fluxo de Mensagens
```
Cliente envia mensagem
↓
Baileys recebe via WebSocket (messages.upsert)
↓
setupMessageListener processa
↓
processBotQuery retorna resposta automática
↓
antiBanDelay aguarda 1.5-3.5s (anti-ban)
↓
Bot envia resposta com presença "composing"
↓
Atendente pode pausar bot e assumir conversa
```

### Comandos do Bot
- `oi`, `ola` → Boas-vindas
- `1`, `orcamento` → Solicitar orçamento
- `2`, `arte` → Aprovação de arte
- `3`, `status`, `pedido` → Consultar status
- `4`, `atendente` → Falar com humano

### API WhatsApp
```bash
# Gerar QR Code
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_qr"}'

# Simular mensagem no bot
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"bot_simulate","phone":"21994427557","message":"oi"}'

# Enviar mensagem real
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"send_message","phone":"21994427557","message":"Olá!"}'

# Pausar bot (atendente assume)
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"pause_bot","phone":"21994427557"}'
```

---

## 🚀 Deploy em Produção

### Servidor (Debian 13)
- **IP**: 201.18.102.195
- **Domínio**: app.vtdigital.site
- **Proxy**: Nginx + Cloudflare Tunnel
- **Process Manager**: PM2

### Deploy via ZIP
```bash
# 1. Programador prepara arquivo
cd /caminho/local
zip -r print-shop-erp-crm-systemXX.zip src/ package.json package-lock.json ...

# 2. Upload do arquivo .zip para servidor

# 3. Servidor extrai e instala
cd /www/wwwroot/erp-grafica
unzip -o print-shop-erp-crm-systemXX.zip
npm install --legacy-peer-deps
npm install @whiskeysockets/baileys sharp jimp
npm run build

# 4. Reinicia aplicação
pm2 restart print-shop-erp

# 5. Verifica
curl http://localhost:3000/api/health
```

### Health Check
```bash
curl http://localhost:3000/api/health
# Resposta esperada: {"ok":true}
```

### Logs
```bash
pm2 logs print-shop-erp
pm2 monit
```

---

## 🔗 Links Úteis

- **Baileys GitHub**: https://github.com/WhiskeySockets/Baileys
- **Drizzle ORM**: https://orm.drizzle.team
- **Next.js 16**: https://nextjs.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs

---

## 📞 Versão Atual
- **v2.8.0** (2026-08-12)
- Módulo de Comunicação Visual (m²)
- WhatsApp Baileys Senior com Live Chat
- CRM + PDV + Kanban integrados
- Pricing engine para 6 tecnologias de impressão

---

## ⚖️ Licença
Uso exclusivo para PrintFlow Gráfica Criativa. Todos os direitos reservados.
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Sincronize o schema com o banco e popule dados iniciais:
```bash
npx drizzle-kit push
npm run build
```

### 3. Iniciar o Servidor
```bash
npm run start
```

---

## 🔄 Script de Atualização e Revisionamento (`scripts/update.sh`)

Para atualizar o servidor Debian mantendo a versão e histórico de alterações:

```bash
chmod +x scripts/update.sh
./scripts/update.sh
```

O script verifica a versão atual em `VERSION`, executa `git pull`, aplica migrações do PostgreSQL, compila o Next.js e reinicia os serviços PM2/Systemd.

---

## 📝 Documentação para Programadores

- **Schema do Banco de Dados:** `src/db/schema.ts`
- **Engines de Cálculo:**
  - `src/lib/laserPricingEngine.ts` (Máquinas Laser e Toners)
  - `src/lib/inkjetPricingEngine.ts` (Jato de Tinta 6 Cores & Fotográfico)
  - `src/lib/sublimationPricingEngine.ts` (Sublimação Gênesis 100ml)
  - `src/lib/thermalPricingEngine.ts` (Impressora Térmica & Ribbons)
  - `src/lib/productPricingEngine.ts` (Ficha Técnica BOM & Markup Financeiro)
- **Script de Migração e Deploy Debian:** `docs/DEBIAN_DEPLOYMENT.md`
- **Histórico de Releases:** `CHANGELOG.md`
