# LEIA PRIMEIRO - Sistema ERP CRM Gráfica & Papelaria

Este repositório contém a versão completa do sistema web fullstack para **Gráfica Rápida, Papelaria Personalizada e Comunicação Visual**.

---

## 🛠️ O Que o Sistema Entrega

1. **Cadastro CRM Completo de Clientes (Pessoa Física & Jurídica):** Validação de CPF, CNPJ, E-mail e busca automática de endereço pelo ViaCEP.
2. **Financeiro Completo (Réplica Foto 01):** DRE, Contas Bancárias, Aging de Inadimplência e Lançamentos.
3. **PDV (Frente de Caixa Balcão):** Emissão de Comprovante Térmico Não Fiscal de 80mm idêntico à Foto 3.
4. **Ficha de Ordem de Produção / Orçamento A4:** Relatório A4 impresso em PDF idêntico à Foto 1.
5. **Módulo de Impressoras & Calculadoras:**
   - Laser Digital (Konica Minolta C284e com 14 consumíveis)
   - Jato de Tinta 6 Cores (Epson EcoTank L18050)
   - Sublimação Gênesis 100ml (Epson L3150 com 100% cobertura)
   - Impressora Térmica & Ribbons (ELGIN L42 Pro FULL)
6. **Materiais e Insumos de Produção:** Estrutura em 4 blocos com conversão de unidades (Pacotes ➔ Folhas/Metros).
7. **Produtos & Ficha Técnica (BOM):** Fator de aproveitamento A3 e consumo com precisão de 4 casas decimais.
8. **WhatsApp Baileys Bridge:** Conexão via QR Code nativo e simulador de bot de autoatendimento.

---

## 📋 Comandos Essenciais

- **Iniciar modo dev:** `npm run dev`
- **Compilar para produção:** `npm run build`
- **Executar tabelas PostgreSQL:** `psql -U postgres -d app_db -f create-tables.sql`
- **Script de Atualização:** `./scripts/update.sh`
