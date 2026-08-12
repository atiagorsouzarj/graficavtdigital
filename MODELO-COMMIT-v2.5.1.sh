#!/bin/bash
# MODELO DE COMMIT ESPERADO PARA v2.5.1
# Execute este script ou use os comandos como referência

echo "═══════════════════════════════════════════════════════════════"
echo "  MODELO DE COMMIT v2.5.1 - WhatsApp Baileys Real"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Verificar status
echo "1️⃣  Verificando status do git..."
git status

echo ""
echo "2️⃣  Adicionando arquivos novos e modificados..."
echo ""
echo "Arquivos que devem ser adicionados:"
echo "  ✨ src/lib/whatsappService.ts (NOVO)"
echo "  ✨ src/app/qr-code/page.tsx (NOVO)"
echo "  ✨ create-tables.sql (NOVO)"
echo "  ✨ GUIA_CRIAR_TABELAS.md (NOVO)"
echo "  ✨ ATUALIZACOES-v2.5.1.md (NOVO)"
echo "  ✨ RESUMO-UPDATE-v2.5.1.txt (NOVO)"
echo "  📝 src/app/api/whatsapp/route.ts (MODIFICADO)"
echo "  📝 package.json (MODIFICADO)"
echo "  📝 package-lock.json (MODIFICADO)"
echo ""

# 2. Adicionar arquivos
echo "3️⃣  Executando: git add -A"
echo ""
read -p "Pressione ENTER para continuar (ou CTRL+C para cancelar)..."

# Descomente a linha abaixo para executar de verdade:
# git add -A

echo ""
echo "4️⃣  Verificando arquivos staged:"
# git status --short

echo ""
echo "5️⃣  Criando commit com mensagem padrão..."
echo ""

# OPÇÃO A: Executar o commit
echo "═══════════════════════════════════════════════════════════════"
echo "COMANDO A EXECUTAR:"
echo "═══════════════════════════════════════════════════════════════"
cat << 'EOF'

git commit -m "v2.5.1: Implementar WhatsApp Baileys real + tabelas PostgreSQL

FEATURES:
- Integração real do Baileys (@whiskeysockets/baileys@6.7.0)
- QR code funcional para pareamento WhatsApp (antes era simulado)
- Página visual /qr-code para escanear com celular
- Script SQL com 16 tabelas PostgreSQL
- Serviço whatsappService.ts com funções: initializeWhatsApp, sendMessage

ARQUIVOS NOVOS:
- src/lib/whatsappService.ts: Serviço WhatsApp com Baileys
- src/app/qr-code/page.tsx: Interface visual para conectar WhatsApp
- create-tables.sql: Script para criar 16 tabelas
- GUIA_CRIAR_TABELAS.md: Manual de instalação
- ATUALIZACOES-v2.5.1.md: Documentação técnica completa
- RESUMO-UPDATE-v2.5.1.txt: Resumo executivo rápido

ARQUIVOS MODIFICADOS:
- src/app/api/whatsapp/route.ts: Usa Baileys real em vez de simulado
- package.json: Adicionadas dependências (baileys, sharp, jimp)
- package-lock.json: Atualizado automaticamente

BANCO DE DADOS:
- 16 tabelas criadas: users, clients, products, quotes_orders, etc
- Schema: public
- Índices de performance adicionados

DEPENDÊNCIAS ADICIONADAS:
- @whiskeysockets/baileys@^6.7.0
- sharp@^0.33.0
- jimp@^0.22.0

INSTRUÇÕES DE ATUALIZAÇÃO:
1. npm install --legacy-peer-deps
2. psql -U postgres -d app_db -f create-tables.sql
3. npm run build
4. pm2 restart erp-grafica

VALIDAÇÃO:
- curl http://localhost:3000/api/whatsapp (testa API)
- curl -X POST http://localhost:3000/api/whatsapp -d '{\"action\":\"generate_qr\"}'
- Acesse http://localhost:3000/qr-code (página visual)

Co-Authored-By: Claude Code <noreply@anthropic.com>"

EOF

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# OPÇÃO B: Após o commit, fazer tag
echo "6️⃣  APÓS o commit acima, executar:"
echo ""
cat << 'EOF'

git tag v2.5.1
git push origin main
git push origin v2.5.1

EOF

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ MODELO DE COMMIT COMPLETO"
echo "═══════════════════════════════════════════════════════════════"
