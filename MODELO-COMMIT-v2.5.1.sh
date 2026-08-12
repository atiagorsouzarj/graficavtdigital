#!/bin/bash
# MODELO DE COMMIT ESPERADO PARA v2.5.1

echo "═══════════════════════════════════════════════════════════════"
echo " MODELO DE COMMIT v2.5.1 - WhatsApp Baileys Real"
echo "═══════════════════════════════════════════════════════════════"

git status

git add -A

git commit -m "v2.5.1: Implementar WhatsApp Baileys real + tabelas PostgreSQL

FEATURES:
- Integração real do Baileys e serviço whatsappService.ts
- QR code funcional em base64 e código de pareamento
- Página visual /qr-code para escanear com celular
- Script SQL com 16 tabelas PostgreSQL (create-tables.sql)
"

git tag v2.5.1
git push origin main
git push origin v2.5.1
