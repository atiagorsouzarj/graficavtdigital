# CHANGELOG - Sistema ERP CRM & Precificação Gráfica Rápida

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [v3.2.0] - 2026-05-18 - Botão de Excluir Produto, Insumo do Estoque no BOM e Opções "Nenhum/Não Usar"

### 🚀 Novidades e Melhorias

1. **Botão de Excluir Produto no Catálogo (`/produtos`):**
   - Adicionado botão de lixeira (`Trash2`) em cada card do catálogo de produtos com prompt de confirmação de exclusão.
2. **Seleção Direta do Estoque de Materiais na Ficha Técnica (BOM):**
   - No construtor da Ficha Técnica, o campo `SKU / COMPONENTE` possui um seletor suspenso direto integrado ao estoque de Materiais e Insumos (`/materiais`).
   - Ao selecionar um papel/mídia, preenche automaticamente o SKU, Nome do Item, Unidade de Consumo e Custo Unitário.
3. **Opções Flexíveis ("Nenhum / Não Usar"):**
   - Categoria de linha: `Nenhum / Não Usar`.
   - Matriz de Aproveitamento: `Não Aplicável (Sem Matriz / Serviço Livre)`.
   - Impressora Vinculada: `Nenhuma / Não Utiliza Impressora (Custo R$ 0,00)`.
   - Modelo Base: `Nenhum Modelo (Ficha Técnica Vazia)`.
4. **Calculadora e Regras de Comunicação Visual ($m^2$):**
   - Suporte a Banners por $m^2$ com trava mínima de R$ 26,00 para peças $< 1m^2$ e Adesivos por $m^2$.

---

## [v3.1.0] - 2026-05-18 - Página Pública de Cadastro e Rastreio em Tempo Real
- Lançamento da Página Pública de Cadastro com carrossel animado e linha do tempo de rastreamento do pedido.
