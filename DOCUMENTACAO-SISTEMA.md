# DOCUMENTAÇÃO TÉCNICA DO SISTEMA

## Estrutura de Código Fonte

```text
graficavtdigital/
├── create-tables.sql               # Script DDL SQL de tabelas PostgreSQL
├── LEIA-PRIMEIRO-v2.5.1.md          # Guia rápido de instalação
├── CHANGELOG.md                    # Registro de alterações
├── VERSION                         # Número da versão atual
├── scripts/
│   └── update.sh                   # Script de atualização automática no Debian
├── src/
│   ├── app/                        # Páginas Next.js (App Router)
│   │   ├── api/                    # API Routes REST
│   │   ├── clientes/               # CRM Clientes
│   │   ├── financeiro/             # DRE Financeiro
│   │   ├── impressoras/            # Precificação de Impressoras
│   │   ├── kanban/                 # Kanban de Produção
│   │   ├── materiais/              # Materiais e Insumos
│   │   ├── orcamentos/             # Orçamentos e PDF
│   │   ├── pdv/                    # Frente de Caixa PDV
│   │   ├── produtos/               # Ficha Técnica BOM
│   │   ├── qr-code/                # Conexão QR Code WhatsApp
│   │   └── whatsapp/               # Bot e Painel WhatsApp
│   ├── components/                 # Componentes React reutilizáveis
│   ├── db/                         # Schema e Conexão PostgreSQL (Drizzle)
│   └── lib/                        # Engines de Precificação e Utilitários
│       ├── laserPricingEngine.ts
│       ├── inkjetPricingEngine.ts
│       ├── sublimationPricingEngine.ts
│       ├── thermalPricingEngine.ts
│       ├── productPricingEngine.ts
│       ├── whatsappService.ts
│       └── validation.ts
```
