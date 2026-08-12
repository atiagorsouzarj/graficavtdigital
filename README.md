# Sistema ERP, CRM e Precificação para Gráfica Rápida e Papelaria Personalizada

[![Versão](https://img.shields.io/badge/Vers%C3%A3o-v2.5.0-blue.svg)](CHANGELOG.md)
[![Status Servidor](https://img.shields.io/badge/Debian-100%25_OK-emerald.svg)](docs/DEBIAN_DEPLOYMENT.md)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15+-336791.svg)](src/db/schema.ts)

Sistema completo de Gestão Gráfica, CRM, Frente de Caixa (PDV), Aprovação de Arte, Kanban de Produção, Financeiro DRE, Logística SuperFrete, Integração WhatsApp Baileys e **Motor de Precificação Dinâmico por Tecnologia de Impressora & Ficha Técnica (BOM)**.

---

## 📌 Principais Módulos do Sistema

1. **Header Bar Superior Fixo (Com busca global `⌘K`, atalhos de orçamento e perfil)**
2. **Financeiro Completo (Réplica Exata Foto 01):** DRE, Contas Bancárias, Aging de Inadimplência, Formas de Recebimento.
3. **Kanban de Produção:** Pipeline de 7 fases (Aguardando Arte ➔ Aprovação ➔ Produção ➔ Impressão ➔ Acabamento ➔ Retirada ➔ Entregue).
4. **Área de Aprovação de Arte (Prova Digital):** Portal para o cliente aprovar o gabarito visual ou solicitar alterações.
5. **PDV (Frente de Caixa Balcão):** Comprovante térmico Não Fiscal de 80mm com QR Code e controle de caixa.
6. **Módulo Impressoras (Calculadora de Insumos & Suprimentos):**
   - **Laser Digital (Konica Minolta bizhub C284e):** 14 consumíveis editáveis, slider de cobertura 5% a 300% e custo por folha A4/A3/A3+.
   - **Jato de Tinta (Epson EcoTank L18050):** 6 refis de tinta 70ml + caixa de manutenção C9345 + simulador fotográfico 10x15, 20x30, 30x40 @ 100% de cobertura.
   - **Sublimação (Epson EcoTank L3150):** Tintas Gênesis Sublidesk 100ml + kit feltros com cobertura travada em 100% full-bleed.
   - **Impressora Térmica (ELGIN L42 Pro FULL):** Cálculo linear de Ribbon (Cera, Misto, Resina, Metálicos R$ 190,00/76m) por metro e por etiqueta.
7. **Materiais e Insumos:** Estrutura nos 4 blocos essenciais (Dados Básicos, Unidades & Estoque Fracionado, Custos & NCM, Atributos Técnicos).
8. **Produtos & Ficha Técnica (BOM):** Preço de venda calculado por composição com até 4 casas decimais na quantidade consumida, margem de perda por refugo, imposto Simples Nacional, taxa da maquininha InfinitePay e lucro bruto.
9. **Logística SuperFrete:** Cotação Correios PAC/SEDEX e Jadlog com código de rastreio.
10. **WhatsApp Baileys & Bot de Autoatendimento:** Conexão via QR Code e mensagens transacionais.
11. **E-mail Transacional com Live Preview:** Editor HTML com renderização em tempo real.
12. **API Externa REST & Telefonia VoIP:** Identificador de chamadas recebidas para pop-up de cliente na tela.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Estilização:** Tailwind CSS v4 + Lucide Icons
- **Banco de Dados:** PostgreSQL via Drizzle ORM
- **Servidor Recomendado:** Debian Linux (4 Cores i3, 12GB RAM, 140GB SSD)

---

## 🚀 Instalação e Execução Rápida

### 1. Clonar o Repositório e Instalar Dependências
```bash
npm install
```

### 2. Configurar o Banco de Dados PostgreSQL
Edite o arquivo `.env`:
```env
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
