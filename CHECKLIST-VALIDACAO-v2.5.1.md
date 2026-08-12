# ✅ Checklist de Validação v2.5.1

**O que verificar ANTES de enviar para produção**

---

## 📁 ARQUIVOS

### Arquivos Novos (DEVEM EXISTIR)

- [ ] `src/lib/whatsappService.ts` (145 linhas)
  ```bash
  wc -l src/lib/whatsappService.ts  # Esperado: ~145
  grep -c "function\|export" src/lib/whatsappService.ts  # Espere: 5+
  ```

- [ ] `src/app/qr-code/page.tsx` (92 linhas)
  ```bash
  wc -l src/app/qr-code/page.tsx  # Esperado: ~92
  grep "use client" src/app/qr-code/page.tsx  # Deve existir
  ```

- [ ] `create-tables.sql` (150 linhas)
  ```bash
  wc -l create-tables.sql  # Esperado: ~150
  grep -c "CREATE TABLE" create-tables.sql  # Esperado: 16
  ```

- [ ] `GUIA_CRIAR_TABELAS.md`
  ```bash
  test -f GUIA_CRIAR_TABELAS.md && echo "✅ Existe"
  ```

- [ ] `ATUALIZACOES-v2.5.1.md`
  ```bash
  test -f ATUALIZACOES-v2.5.1.md && echo "✅ Existe"
  ```

- [ ] `RESUMO-UPDATE-v2.5.1.txt`
  ```bash
  test -f RESUMO-UPDATE-v2.5.1.txt && echo "✅ Existe"
  ```

### Arquivos Modificados (DEVEM CONTER MUDANÇAS)

- [ ] `src/app/api/whatsapp/route.ts`
  ```bash
  grep "whatsappService\|initializeWhatsApp" src/app/api/whatsapp/route.ts
  # Esperado: 3+ ocorrências
  ```

- [ ] `package.json`
  ```bash
  grep "@whiskeysockets/baileys" package.json  # Deve existir
  grep "sharp" package.json  # Deve existir
  grep "jimp" package.json  # Deve existir
  ```

- [ ] `package-lock.json`
  ```bash
  grep -c "@whiskeysockets/baileys" package-lock.json  # Esperado: 10+
  ```

---

## 📦 DEPENDÊNCIAS

- [ ] Baileys instalado
  ```bash
  npm list @whiskeysockets/baileys
  # Esperado: @whiskeysockets/baileys@^6.7.0
  ```

- [ ] Sharp instalado
  ```bash
  npm list sharp
  # Esperado: sharp@^0.33.0 (ou similar)
  ```

- [ ] Jimp instalado
  ```bash
  npm list jimp
  # Esperado: jimp@^0.22.0 (ou similar)
  ```

- [ ] QRCode instalado
  ```bash
  npm list qrcode
  # Esperado: já existia em versões anteriores
  ```

---

## 🔨 BUILD

- [ ] Build sem erros
  ```bash
  npm run build
  # Esperado: ✅ Build completo sem erros
  # Esperado no log: "Route (app)" + "/qr-code"
  ```

- [ ] Arquivo .next gerado
  ```bash
  test -d .next && echo "✅ .next existe"
  test -f .next/server/app/api/whatsapp/route.js && echo "✅ API route compilada"
  ```

- [ ] Página QR code compilada
  ```bash
  ls -la .next/server/app/qr-code/
  # Esperado: arquivos da página compilada
  ```

---

## 🗄️ BANCO DE DADOS

- [ ] Arquivo SQL válido
  ```bash
  psql -U postgres -d postgres --single-transaction -f create-tables.sql
  # Esperado: sem erros de sintaxe
  ```

- [ ] Tabelas criadas (APÓS executar script)
  ```bash
  psql -U postgres -d app_db -c "\dt public.*" | wc -l
  # Esperado: 20+ (16 tabelas + headers)
  ```

- [ ] Tabelas específicas existem
  ```bash
  psql -U postgres -d app_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users','clients','products','quotes_orders','whatsapp_config');"
  # Esperado: 5 (todas as tabelas críticas)
  ```

- [ ] Índices criados
  ```bash
  psql -U postgres -d app_db -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';"
  # Esperado: 7+ (índices de performance)
  ```

---

## 🌐 API ENDPOINTS

- [ ] API GET /whatsapp funciona
  ```bash
  curl http://localhost:3000/api/whatsapp | head -c 50
  # Esperado: {"config": {"id":...
  ```

- [ ] API POST /whatsapp action=generate_qr funciona
  ```bash
  curl -X POST http://localhost:3000/api/whatsapp \
    -H "Content-Type: application/json" \
    -d '{"action":"generate_qr"}' | head -c 50
  # Esperado: {"success":true,"qrCodeUrl":"data:image/png;base64,...
  ```

- [ ] API POST /whatsapp action=status funciona
  ```bash
  curl -X POST http://localhost:3000/api/whatsapp \
    -H "Content-Type: application/json" \
    -d '{"action":"status"}' | head -c 50
  # Esperado: {"isConnected":...,"phoneNumber":...,"hasQR":...
  ```

---

## 🎨 PÁGINAS

- [ ] Página /qr-code carrega
  ```bash
  curl http://localhost:3000/qr-code | grep -c "Conectar WhatsApp"
  # Esperado: 1+
  ```

- [ ] Página /qr-code tem instruções
  ```bash
  curl http://localhost:3000/qr-code | grep -c "Escaneie o código QR"
  # Esperado: 1+
  ```

---

## 🚀 PM2

- [ ] Processo está rodando
  ```bash
  pm2 status | grep "print-shop-erp\|erp-grafica"
  # Esperado: online
  ```

- [ ] Build sem erros no PM2
  ```bash
  pm2 logs print-shop-erp --lines 5
  # Esperado: sem erros de módulo
  ```

---

## 📊 TESTE COMPLETO (FINAL)

Executar toda a sequência:

```bash
# 1. Ambiente
echo "✅ Node version:"
node -v

echo "✅ NPM version:"
npm -v

echo "✅ PostgreSQL version:"
psql --version

# 2. Dependências
echo "✅ Checking Baileys..."
npm list @whiskeysockets/baileys | head -1

# 3. Build
echo "✅ Building..."
npm run build && echo "✅ Build OK"

# 4. Banco
echo "✅ Creating tables..."
psql -U postgres -d app_db -f create-tables.sql

# 5. Contar tabelas
echo "✅ Table count:"
psql -U postgres -d app_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# 6. Reiniciar
echo "✅ Restarting PM2..."
pm2 restart erp-grafica

# 7. Esperar servidor
sleep 3

# 8. Testar API
echo "✅ Testing API /whatsapp..."
curl -s http://localhost:3000/api/whatsapp | grep -q "config" && echo "✅ GET OK"

echo "✅ Testing QR code generation..."
curl -s -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_qr"}' | grep -q "qrCodeUrl" && echo "✅ POST OK"

# 9. Verificar página
echo "✅ Testing page /qr-code..."
curl -s http://localhost:3000/qr-code | grep -q "Conectar WhatsApp" && echo "✅ Page OK"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ TODOS OS TESTES PASSARAM!"
echo "═══════════════════════════════════════════════════════════════"
```

---

## 🔴 PROBLEMAS COMUNS

Se algum teste FALHAR:

| Teste | Falha | Solução |
|-------|-------|---------|
| Arquivo não existe | `test: command not found` | Verificar se arquivo está no diretório |
| Build error | `Can't resolve 'jimp'` | `npm install --legacy-peer-deps` |
| API error | `Table not found` | `psql -U postgres -d app_db -f create-tables.sql` |
| QR code vazio | `qrCodeUrl: null` | Aguardar 5 segundos, Baileys está gerando |
| PM2 offline | `status: stopped` | `pm2 restart erp-grafica` ou `npm run build` |
| Porta em uso | `EADDRINUSE` | `pm2 kill` + `pm2 start npm --name "erp-grafica" -- start` |

---

## ✅ APROVADO PARA PRODUÇÃO?

Responda SIM a TODAS as perguntas abaixo:

- [ ] Todos os arquivos novos existem?
- [ ] Todos os arquivos modificados estão corretos?
- [ ] npm list mostra as 3 novas dependências?
- [ ] npm run build passou sem erros?
- [ ] create-tables.sql tem 16 CREATE TABLE?
- [ ] Banco foi atualizado (16+ tabelas criadas)?
- [ ] curl /api/whatsapp retorna JSON com "config"?
- [ ] curl /qr-code retorna HTML com a página?
- [ ] PM2 está online?
- [ ] Nenhum erro nos logs?

**Se TODAS forem SIM → ✅ PRONTO PARA PRODUÇÃO**

---

## 📋 GITIGNORE

Verificar se `.gitignore` tem:

```bash
cat .gitignore | grep -E ".wh-auth|.env|node_modules"
# Esperado: 3 linhas (ou mais)
```

Se não tiver, adicionar:
```
.wh-auth/
.env
.env.local
node_modules/
```

---

## 🎯 RESULTADO FINAL

**RESULTADO:**
- [ ] ✅ VALIDAÇÃO COMPLETA - Pronto para envio
- [ ] ❌ FALHAS ENCONTRADAS - Revisar checklist

**DATA VALIDAÇÃO:** _______________
**RESPONSÁVEL:** _______________

---

**Arquivo:** CHECKLIST-VALIDACAO-v2.5.1.md  
**Versão:** v2.5.1  
**Data:** 2026-08-12
