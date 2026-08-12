# Atualização v2.5.1 - WhatsApp Baileys Real + Banco de Dados PostgreSQL

**Data:** 2026-08-12  
**Status:** ✅ Pronto para Produção  

---

## 📋 Resumo das Mudanças

### 1. Criação de Tabelas PostgreSQL
- Gerado script SQL `create-tables.sql` com as 16 tabelas do sistema.
- Execução direta via:
  ```bash
  psql -U postgres -d app_db -f create-tables.sql
  ```

### 2. Integração do Baileys WebSockets Bridge
- Novo serviço: `src/lib/whatsappService.ts`
- Geração nativa de QR Code PNG base64 (`QRCode.toDataURL`).
- Endpoint `/api/whatsapp` com ações de geração de QR Code, pareamento, bot e mensagens transacionais.
- Página dedicada de escaneamento em `/qr-code`.

### 3. Documentação Completa Incluída
- `LEIA-PRIMEIRO-v2.5.1.md`
- `RESUMO-UPDATE-v2.5.1.txt`
- `ATUALIZACOES-v2.5.1.md`
- `GUIA_CRIAR_TABELAS.md`
- `CHECKLIST-VALIDACAO-v2.5.1.md`
- `MODELO-COMMIT-v2.5.1.sh`
- `create-tables.sql`

---

## 🚀 Passos de Atualização
```bash
npm install --legacy-peer-deps
psql -U postgres -d app_db -f create-tables.sql
npm run build
pm2 restart erp-grafica
```
