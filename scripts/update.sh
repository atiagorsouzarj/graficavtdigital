#!/bin/bash
# ==============================================================================
# Script de Atualização e Revisionamento de Versão
# Servidor Debian Linux - ERP CRM Gráfica Rápida & Papelaria Personalizada
# ==============================================================================

set -e

# Cores para Saída
GREEN='\033[0;32m'
SKY='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CURRENT_VERSION=$(cat VERSION 2>/dev/null || echo "2.5.0")

echo -e "${SKY}==================================================================${NC}"
echo -e "${SKY}🚀 INICIANDO ATUALIZAÇÃO DO SISTEMA ERP CRM GRÁFICA (v${CURRENT_VERSION})${NC}"
echo -e "${SKY}==================================================================${NC}"

# 1. Verificar Estado do Git
echo -e "\n${YELLOW}1/5. Verificando repositório Git e histórico de alterações...${NC}"
if [ -d ".git" ]; then
    git fetch origin
    git status -s
    echo -e "${GREEN}✓ Repositório Git ativo na branch: $(git rev-parse --abbrev-ref HEAD)${NC}"
    echo -e "${GREEN}✓ Último Commit: $(git log -1 --pretty=format:'%h - %s (%cr) <%an>')${NC}"
else
    echo -e "${YELLOW}⚠️ Repositório .git não inicializado localmente. Continuando atualização de arquivos...${NC}"
fi

# 2. Instalar Novas Dependências
echo -e "\n${YELLOW}2/5. Atualizando pacotes npm...${NC}"
npm install --production=false

# 3. Aplicar Alterações na Estrutura do PostgreSQL
echo -e "\n${YELLOW}3/5. Atualizando tabelas no PostgreSQL (Drizzle ORM)...${NC}"
npx drizzle-kit push

# 4. Build de Produção
echo -e "\n${YELLOW}4/5. Compilando otimizações de produção do Next.js...${NC}"
npm run build

# 5. Leitura Final de Versão e Reinício do Serviço
NEW_VERSION=$(cat VERSION 2>/dev/null || echo "2.5.0")

echo -e "\n${YELLOW}5/5. Reiniciando servidor Debian e aplicando serviços...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart grafica-erp || pm2 start npm --name "grafica-erp" -- start
elif systemctl is-active --quiet grafica-erp.service; then
    sudo systemctl restart grafica-erp.service
else
    echo -e "${GREEN}✓ Servidor pronto para execução via 'npm start'${NC}"
fi

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}✅ SISTEMA ATUALIZADO COM SUCESSO PARA A VERSÃO v${NEW_VERSION}!${NC}"
echo -e "${GREEN}==================================================================${NC}"
