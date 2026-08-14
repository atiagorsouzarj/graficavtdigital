#!/bin/bash
# ==============================================================================
# 🚀 INSTALADOR AUTOMÁTICO - PrintFlow ERP v3.3.2
#    Migração de banco + dependências + build + restart, tudo em um comando.
#
# USO (na pasta do sistema, após extrair o ZIP):
#    chmod +x instalar-update.sh
#    ./instalar-update.sh
#
# Variáveis opcionais (defaults entre parênteses):
#    DB_HOST (127.0.0.1)  DB_USER (postgres)  DB_NAME (app_db)
#    PM2_APP (print-shop-erp)
# ==============================================================================

set -e

GREEN='\033[0;32m'; SKY='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-app_db}"
PM2_APP="${PM2_APP:-print-shop-erp}"
NEW_VERSION=$(cat VERSION 2>/dev/null || echo "3.3.2")

echo -e "${SKY}==============================================================${NC}"
echo -e "${SKY}🚀 PrintFlow ERP - Instalador Automático v${NEW_VERSION}${NC}"
echo -e "${SKY}==============================================================${NC}"

# ------------------------------------------------------------------
# 0. Pré-checagens
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[0/7] Pré-checagens...${NC}"

if [ ! -f "package.json" ]; then
  echo -e "${RED}✗ Execute este script DENTRO da pasta do sistema (onde está o package.json).${NC}"
  exit 1
fi

# Espaço em disco (mínimo 2GB livres para build seguro)
FREE_KB=$(df -Pk . | awk 'NR==2 {print $4}')
if [ "$FREE_KB" -lt 2097152 ]; then
  echo -e "${RED}✗ Menos de 2GB livres em disco ($(df -Ph . | awk 'NR==2 {print $4'}) livre).${NC}"
  echo -e "${RED}  Libere espaço antes de continuar (builds com disco cheio corrompem o .next).${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Disco OK ($(df -Ph . | awk 'NR==2 {print $4}') livres)${NC}"

command -v node >/dev/null || { echo -e "${RED}✗ Node.js não encontrado${NC}"; exit 1; }
command -v npm  >/dev/null || { echo -e "${RED}✗ npm não encontrado${NC}"; exit 1; }
echo -e "${GREEN}✓ Node $(node -v) / npm $(npm -v)${NC}"

# ------------------------------------------------------------------
# 1. Backup do banco
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[1/7] Backup do banco de dados...${NC}"
BACKUP_FILE="backup-db-antes-v${NEW_VERSION}-$(date +%Y%m%d-%H%M%S).sql"
if command -v pg_dump >/dev/null; then
  if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Backup salvo: ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))${NC}"
  else
    echo -e "${YELLOW}⚠ Não foi possível fazer backup automático (verifique credenciais).${NC}"
    read -p "  Continuar sem backup? (s/N) " CONT
    [ "$CONT" = "s" ] || [ "$CONT" = "S" ] || exit 1
  fi
else
  echo -e "${YELLOW}⚠ pg_dump não encontrado — pulando backup.${NC}"
fi

# ------------------------------------------------------------------
# 2. Migração do banco (idempotente — segura de repetir)
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[2/7] Aplicando migração do banco (v3.3.0 Client Portal)...${NC}"
if [ -f "migrations/v3.3.0-client-portal.sql" ]; then
  if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f migrations/v3.3.0-client-portal.sql -q 2>/dev/null; then
    echo -e "${GREEN}✓ Migração aplicada (ou já estava aplicada — é idempotente)${NC}"
  else
    echo -e "${RED}✗ Falha na migração. Rode manualmente:${NC}"
    echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/v3.3.0-client-portal.sql"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ migrations/v3.3.0-client-portal.sql não encontrado — pulando.${NC}"
fi

# ------------------------------------------------------------------
# 3. Dependências (inclui nodemailer novo na v3.3.2)
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[3/7] Instalando dependências (npm install --legacy-peer-deps)...${NC}"
npm install --legacy-peer-deps --no-fund --no-audit
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# Verificação das críticas (regra do README)
for dep in @whiskeysockets/baileys sharp jimp nodemailer; do
  if [ -d "node_modules/$dep" ]; then
    echo -e "${GREEN}  ✓ $dep${NC}"
  else
    echo -e "${RED}  ✗ $dep FALTANDO — instalando individualmente...${NC}"
    npm install "$dep" --legacy-peer-deps --no-fund --no-audit
  fi
done

# ------------------------------------------------------------------
# 4. Verificação obrigatória do WhatsApp (regra do README)
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[4/7] Verificando WhatsApp Baileys (makeWASocket)...${NC}"
WA_COUNT=$(grep -c "makeWASocket" src/lib/whatsappService.ts 2>/dev/null || echo 0)
if [ "$WA_COUNT" -ge 3 ]; then
  echo -e "${GREEN}✓ makeWASocket presente ${WA_COUNT}x (regra: 3+)${NC}"
else
  echo -e "${RED}✗ FALHA CRÍTICA: makeWASocket retornou ${WA_COUNT} (< 3). NÃO CONTINUE.${NC}"
  echo -e "${RED}  O WhatsApp foi alterado indevidamente. Rejeite este pacote.${NC}"
  exit 1
fi

# ------------------------------------------------------------------
# 5. Build limpo (evita .next corrompido)
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[5/7] Parando app e fazendo build limpo...${NC}"
if command -v pm2 >/dev/null && pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 stop "$PM2_APP" >/dev/null 2>&1 || true
  echo -e "${GREEN}✓ ${PM2_APP} parado durante o build${NC}"
fi
rm -rf .next
npm run build
echo -e "${GREEN}✓ Build de produção concluído${NC}"

# ------------------------------------------------------------------
# 6. Reiniciar aplicação
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[6/7] Reiniciando aplicação...${NC}"
if command -v pm2 >/dev/null && pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
  pm2 save >/dev/null 2>&1 || true
  echo -e "${GREEN}✓ PM2: ${PM2_APP} reiniciado${NC}"
else
  echo -e "${YELLOW}⚠ App '$PM2_APP' não encontrado no PM2. Inicie manualmente:${NC}"
  echo "  pm2 start npm --name \"$PM2_APP\" -- start"
fi

# ------------------------------------------------------------------
# 7. Validação final
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[7/7] Validando...${NC}"
sleep 4
HEALTH=$(curl -s --max-time 10 http://localhost:3000/api/health 2>/dev/null || echo "sem resposta")
if echo "$HEALTH" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Health check: ${HEALTH}${NC}"
else
  echo -e "${YELLOW}⚠ Health check: ${HEALTH} — verifique: pm2 logs ${PM2_APP}${NC}"
fi

CSS_FILE=$(curl -s --max-time 10 http://localhost:3000/ 2>/dev/null | grep -oE '/_next/static/[^"]+\.css' | head -1)
if [ -n "$CSS_FILE" ]; then
  CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3000$CSS_FILE")
  if [ "$CSS_CODE" = "200" ]; then
    echo -e "${GREEN}✓ CSS OK (${CSS_FILE} → 200)${NC}"
  else
    echo -e "${RED}✗ CSS retornou ${CSS_CODE} — build possivelmente corrompido, rode o script de novo${NC}"
  fi
fi

echo -e "\n${SKY}==============================================================${NC}"
echo -e "${GREEN}🎉 ATUALIZAÇÃO v${NEW_VERSION} CONCLUÍDA!${NC}"
echo -e "${SKY}==============================================================${NC}"
echo -e "
${YELLOW}PRÓXIMOS PASSOS:${NC}
 1. Se usa Cloudflare: faça ${SKY}Purge Everything${NC} no cache
 2. Abra /configuracoes → Portal do Cliente → ${SKY}E-mail do Portal (SMTP)${NC}
    - Preencha Host, Porta, Usuário, Senha (Senha de App) e Remetente
    - Use o botão ${SKY}'Enviar e-mail de teste'${NC} para validar na hora
 3. Desative o ${SKY}Modo Demo${NC} quando terminar os testes
 4. Teste o login real: /cliente/login → CPF → código chega no e-mail
"
