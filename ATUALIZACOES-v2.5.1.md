# Atualização v2.5.1 - WhatsApp Baileys Real + Banco de Dados PostgreSQL

**Data:** 2026-08-12  
**Desenvolvedor:** Claude Code (Automação)  
**Objetivo:** Implementar WhatsApp com Baileys real + criar tabelas PostgreSQL que faltavam

---

## 📋 Resumo das Mudanças

### ✅ O que foi feito:

1. **Criação de Tabelas PostgreSQL** 
   - Gerado script SQL com 16 tabelas do schema.ts
   - Todas as tabelas criadas no banco `app_db` schema `public`
   - Índices de performance adicionados

2. **Integração Real do Baileys**
   - Instalado pacotes: `@whiskeysockets/baileys`, `sharp`, `jimp`
   - Criado serviço WhatsApp com QR code real
   - Endpoint `/api/whatsapp` agora gera QR válido
   - Página visual `/qr-code` para escanear no celular

3. **Documentação**
   - `GUIA_CRIAR_TABELAS.md` - Manual SQL
   - `create-tables.sql` - Script para criar tabelas
   - Página `/qr-code` para conexão WhatsApp visual

---

## 📦 Arquivos Novos / Modificados

### Novos Arquivos:

```
✨ src/lib/whatsappService.ts (145 linhas)
   └─ Serviço real de WhatsApp com Baileys
   └─ Funções: initializeWhatsApp(), getWhatsAppInstance(), sendMessage()
   └─ QR code gerado dinamicamente via makeWASocket
   └─ Armazena credenciais em .wh-auth/

✨ src/app/qr-code/page.tsx (92 linhas)
   └─ Página visual para escanear QR code
   └─ Interface React com instruções passo-a-passo
   └─ Botão para regenerar QR code

✨ create-tables.sql (150 linhas)
   └─ Script SQL completo com 16 tabelas
   └─ Pronto para rodar: psql -U postgres -d app_db -f create-tables.sql

✨ GUIA_CRIAR_TABELAS.md (180 linhas)
   └─ Manual passo-a-passo para criar tabelas
   └─ Troubleshooting e verificações
```

### Arquivos Modificados:

```
📝 src/app/api/whatsapp/route.ts
   └─ GET: Retorna QR code real (não simulado)
   └─ POST action="generate_qr": Inicia Baileys
   └─ POST action="send_message": Envia via WhatsApp real
   └─ POST action="status": Verifica conexão
   └─ Importa: initializeWhatsApp, getWhatsAppInstance, sendMessage

📝 package.json
   └─ Adicionadas dependências:
      ├─ @whiskeysockets/baileys@latest
      ├─ sharp (para processamento de mídia)
      └─ jimp (para imagens)
```

---

## 🔧 Dependências Adicionadas

```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "sharp": "^0.33.0",
    "jimp": "^0.22.0"
  }
}
```

**Instalar em nova máquina:**
```bash
npm install --legacy-peer-deps
```

---

## 📊 Estrutura do Banco de Dados

16 tabelas criadas em `app_db` (schema `public`):

| # | Tabela | Tipo | Descrição |
|---|--------|------|-----------|
| 1 | `users` | 📋 | Operadores/funcionários |
| 2 | `clients` | 👥 | Clientes CRM (PF/PJ) |
| 3 | `printer_categories` | 🏷️ | Categorias de impressoras |
| 4 | `printers` | 🖨️ | Máquinas com cálculos |
| 5 | `materials` | 📄 | Papéis e insumos |
| 6 | `finishes` | ✂️ | Acabamentos |
| 7 | `products` | 📦 | Produtos com BOM |
| 8 | `quotes_orders` | 📄 | Orçamentos/Pedidos |
| 9 | `quote_order_items` | 📋 | Itens de pedidos |
| 10 | `financial_accounts` | 🏦 | Contas bancárias |
| 11 | `financial_transactions` | 💳 | Movimentações financeiras |
| 12 | `pdv_shifts` | 🔔 | Turnos de caixa |
| 13 | `system_settings` | ⚙️ | Configurações do sistema |
| 14 | `communication_templates` | 📬 | Modelos de mensagens |
| 15 | `whatsapp_config` | 💬 | Config Baileys (QR, token, status) |
| 16 | `api_keys` | 🔐 | Chaves de APIs externas |

---

## 🚀 Como o Próximo Update Deve Vir

### 1. **Estrutura de Pastas esperada:**

```
print-shop-erp-v2.5.1/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── whatsapp/
│   │   │       └── route.ts ⚠️ MODIFICADO
│   │   └── qr-code/
│   │       └── page.tsx ✨ NOVO
│   ├── lib/
│   │   └── whatsappService.ts ✨ NOVO
│   └── db/
│       ├── schema.ts (sem mudanças)
│       └── index.ts (sem mudanças)
├── .wh-auth/ ← (CRIADO AUTOMATICAMENTE ao conectar WhatsApp)
├── create-tables.sql ✨ NOVO
├── GUIA_CRIAR_TABELAS.md ✨ NOVO
├── ATUALIZACOES-v2.5.1.md ✨ NOVO
├── package.json ⚠️ MODIFICADO
├── package-lock.json ⚠️ MODIFICADO
└── [outros arquivos inalterados]
```

### 2. **Como deve vir do programador (ZIP):**

```bash
# Empacotar TUDO (incluindo .wh-auth se conectado antes):
tar -czf print-shop-erp-v2.5.1.tar.gz print-shop-erp/

# Ou via git (RECOMENDADO):
git commit -m "v2.5.1: Baileys real + tabelas PostgreSQL"
git tag v2.5.1
git push origin v2.5.1
```

### 3. **Versão e Changelog:**

```markdown
# v2.5.1 - 2026-08-12

## ✨ Novidades
- WhatsApp com Baileys real (antes era simulado)
- QR code funcional para pareamento WhatsApp
- Página visual `/qr-code` para escanear
- Banco de dados PostgreSQL completamente criado

## 🔧 Técnico
- Adicionado `@whiskeysockets/baileys@6.7.0`
- 16 tabelas PostgreSQL criadas
- Serviço de WhatsApp com singleton pattern
- Credenciais armazenadas em `.wh-auth/`

## 🐛 Bugfix
- [x] QR code inválido (era simulado, agora real)
- [x] Tabelas PostgreSQL não existiam
- [x] API /whatsapp retornava erro "table not found"

## 📖 Documentação
- `GUIA_CRIAR_TABELAS.md` - Como criar tabelas manualmente
- `create-tables.sql` - Script SQL pronto
- `/qr-code` - Interface visual para conectar WhatsApp
```

---

## ✅ Checklist para o Próximo Update

Quando o programador enviar a v2.5.1, **verificar:**

- [ ] **Pasta `.wh-auth/`** existe (ou será criada ao conectar)
- [ ] **Arquivo `src/lib/whatsappService.ts`** presente (145 linhas)
- [ ] **Arquivo `src/app/qr-code/page.tsx`** presente (92 linhas)
- [ ] **Arquivo `create-tables.sql`** presente
- [ ] **Arquivo `package.json`** tem `@whiskeysockets/baileys`
- [ ] **Arquivo `src/app/api/whatsapp/route.ts`** importa whatsappService
- [ ] **Versão** em `README.md` atualizada para v2.5.1

### Teste de Validação:

```bash
# 1. Clonar/descompactar
unzip print-shop-erp-v2.5.1.zip
cd print-shop-erp

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Criar tabelas (se não existirem)
psql -U postgres -d app_db -f create-tables.sql

# 4. Build
npm run build

# 5. Iniciar
pm2 start npm --name "erp-grafica" -- start

# 6. Testar endpoints
curl http://localhost:3000/api/whatsapp
# Deve retornar: {"config": {...}, "templates": [...], "socketInfo": {...}}

curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_qr"}'
# Deve retornar: {"success": true, "qrCodeUrl": "data:image/png;base64,..."}

# 7. Acessar página QR
curl http://localhost:3000/qr-code
# Deve retornar HTML da página visual
```

---

## 🎯 Instruções para Atualizar (Procedimento v2.5.1)

### **Passo 1: Descompactar/Clonar**
```bash
cd /www/wwwroot
rm -rf erp-grafica-backup-v2.5.0
mv erp-grafica erp-grafica-backup-v2.5.0
unzip print-shop-erp-v2.5.1.zip
cd erp-grafica
```

### **Passo 2: Preparar .env**
```bash
# Verificar DATABASE_URL
cat .env.local
# Esperado: DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db?schema=print_shop
```

### **Passo 3: Instalar Dependências**
```bash
npm install --legacy-peer-deps
```

### **Passo 4: Criar Tabelas PostgreSQL**
```bash
# Se tabelas não existirem:
psql -U postgres -d app_db -f create-tables.sql

# Verificar:
psql -U postgres -d app_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Esperado: 16+ tabelas
```

### **Passo 5: Build e Reiniciar**
```bash
npm run build
pm2 restart erp-grafica
# ou: pm2 start npm --name "erp-grafica" -- start
```

### **Passo 6: Testar**
```bash
# Verificar saúde
curl http://localhost:3000/api/health
# Esperado: {"ok": true}

# Gerar QR code
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_qr"}'
# Esperado: {"success": true, "qrCodeUrl": "data:image/png;base64,..."}

# Acessar visual
open http://localhost:3000/qr-code
# Esperado: Página com QR code visível, instruções em português
```

---

## 📝 Notas para o Git/Versionamento

### **Commits esperados nesta versão:**

```bash
git log --oneline
# v2.5.1 - Baileys real + tabelas PostgreSQL (esta)
# v2.5.0 - Versão anterior com simulador
```

### **Como o programador deve fazer commit:**

```bash
git add -A
git commit -m "v2.5.1: Implementar Baileys real + criar tabelas PostgreSQL

- Instalar @whiskeysockets/baileys@6.7.0
- Criar serviço whatsappService.ts com QR code real
- Página visual /qr-code para escanear WhatsApp
- Script create-tables.sql com 16 tabelas
- Atualizar /api/whatsapp para usar Baileys real

Co-Authored-By: Claude Code <noreply@anthropic.com>"

git tag v2.5.1
git push origin main
git push origin v2.5.1
```

---

## 🔐 Segurança & Credenciais

⚠️ **IMPORTANTE:**

- Pasta `.wh-auth/` é criada AUTOMATICAMENTE ao conectar WhatsApp
- Contém credenciais de sessão do Baileys (SENSÍVEL)
- **NUNCA** commitá-la no git (adicionar ao `.gitignore`)
- Se atualizar, `.wh-auth/` será recriada ao escanear novo QR

### `.gitignore` (verificar se tem):
```
.wh-auth/
.env
.env.local
node_modules/
.next/
dist/
```

---

## 🚨 Possíveis Problemas & Soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| QR code branco/vazio | Baileys ainda gerando | Aguarde 5 segundos, recarregue |
| "Table not found" | Tabelas não criadas | `psql -U postgres -d app_db -f create-tables.sql` |
| "Module not found: jimp" | npm install incompleto | `npm install --legacy-peer-deps` |
| Erro ao conectar WhatsApp | Rede bloqueada | Usar VPN ou desbloquear WhatsApp.com |
| Credenciais expiradas (.wh-auth) | Sessão antiga | Deletar `.wh-auth/` e gerar novo QR |

---

## 📞 Suporte Técnico

Se houver erro:

1. **Verificar logs:**
   ```bash
   pm2 logs erp-grafica --lines 50
   ```

2. **Verificar banco de dados:**
   ```bash
   psql -U postgres -d app_db -c "\dt"
   # Listar todas as tabelas
   ```

3. **Verificar dependências:**
   ```bash
   npm list @whiskeysockets/baileys sharp jimp
   ```

4. **Limpar cache:**
   ```bash
   rm -rf node_modules/.cache
   npm run build --reset-cache
   ```

---

## ✨ Proximas Melhorias Sugeridas (v2.5.2+)

- [ ] Armazenar QR code em banco de dados para dashboard
- [ ] Implementar retry automático de conexão
- [ ] Adicionar webhook para mensagens recebidas
- [ ] Sistema de fila para envio em massa
- [ ] Dashboard de status do WhatsApp em tempo real

---

**Versão:** v2.5.1  
**Status:** ✅ Pronto para produção  
**Data:** 2026-08-12  
**Validado por:** Claude Code
