# CHANGELOG - Sistema ERP CRM & Precificação Gráfica Rápida

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

## [v2.5.0] - 2026-05-18 - Versão Enterprise Completa

### 🚀 Novidades e Módulos Implementados

#### 1. Módulo de Precificação de Produtos & Ficha Técnica (BOM)
- **Engine de Ficha Técnica (BOM):** Suporte a até 4 casas decimais no consumo de materiais (tipo `DECIMAL(10,4)`), permitindo tiragens exatas de cartões (ex: `4.1600` folhas A3), adesivos (`0.0250` folhas A3), caixas e rótulos sem perdas financeiras.
- **Matriz de Aproveitamento A3:** Tabela de formatos parametrizados (24 un/A3, 40 un/A3, 54 un/A3, 108 un/A3, 4 un/A3, 1 un/A3).
- **Cálculo de Margens e Impostos (%):** Perda de refugo/erro de impressão (%), Imposto/Simples Nacional (%), Maquininha InfinitePay (%) e Margem de Lucro Bruto (%).
- **Editor de Ficha Técnica em Tempo Real:** Tela inteira com recálculo instantâneo de custo base, custo com perda, preço sugerido, preço mínimo protegido e lucro real.

#### 2. Módulo de Impressoras & Calculadoras por Categoria
- **Laser Digital (Konica Minolta bizhub C284e):**
  - Tabela com 14 consumíveis editáveis (Toners CMYK @ 5%, Cilindros CMYK, Reveladores CMYK, Película de Fusão e Belt de Transferência).
  - Slider de área de cobertura total (5% a 300%) com divisão CMYK e recálculo do rendimento real dos toners.
  - Resultados para A4 Colorido, P&B, A3 e A3+.
- **Jato de Tinta (Epson EcoTank L18050):**
  - Tabela com os 6 refis de tinta de 70ml (K, C, M, Y, LC, LM) + Caixa de Manutenção / Reservatório C9345 com chip.
  - Simulador para Papéis Fotográficos (10x15cm, 20x30cm e 30x40cm) com cobertura forçada em 100% full bleed.
- **Sublimação (Epson EcoTank L3150 Sublimática):**
  - 4 Frascos de Tinta Gênesis Sublidesk 100ml (K, C, M, Y) + Kit Feltros de resíduo L3150.
  - Regra de cobertura fixada em 100% para transfer sublimático.
- **Impressora Térmica (ELGIN L42 Pro FULL):**
  - Cálculo por metro linear de Ribbon (Cera, Misto Cera/Resina, Resina e Resina Metálica Rosé/Prata/Dourado R$ 190,00) + Desgaste da Cabeça Térmica (50km).
  - Simulador de tiragem por metragem do rolo de etiquetas (ex: 26m / 1000un = R$ 0,0650/un).
  - Layout em 2 colunas para organização dos cards de resumo.

#### 3. Módulo de Materiais e Insumos de Produção
- **Fator de Conversão e Fracionamento:** Cadastro de Pacote/Resma/Rolo com conversão automática para Folhas/Metros (ex: 1 PCT = 100 FLS) gerando o custo unitário exato por folha/metro.
- **Checklist dos 4 Blocos Estruturados:**
  - `[ 1. DADOS BÁSICOS ]`: Nome Comercial, SKU/Código Interno, Categoria.
  - `[ 2. UNIDADES E ESTOQUE ]`: Unidade de Compra, Unidade de Consumo, Fator de Conversão, Estoque Atual e Mínimo.
  - `[ 3. CUSTOS E TRIBUTOS ]`: Preço de Compra da Embalagem, Custo Unitário Automático, NCM Fiscal.
  - `[ 4. ATRIBUTOS / CARACTERÍSTICAS ]`: Gramatura (g/m²), Formato/Dimensões (A4, 66x96cm), Acabamento.

#### 4. Módulo Financeiro (Fidelidade Foto 01)
- Balanço de contas (*Caixa Loja*, *Banco Inter*, *InfinitePay*, *VTO Digital*).
- DRE, Fluxo de Caixa, Aging da Inadimplência e Lançamentos idênticos à Foto 01.

#### 5. Módulo Operacional & Comunicação
- **PDV de Balcão:** Caixa com comprovante não fiscal em papel térmico de 80mm e QR Code.
- **Kanban de Produção:** 7 colunas de pipeline operacional.
- **Área de Aprovação de Arte:** Portal de validação de prova digital pelo cliente.
- **WhatsApp Baileys & Bot de Segurança:** QR Code de pareamento e bot de mensagens transacionais.
- **E-mail Transacional com Preview ao Vivo:** Editor de templates com renderização HTML em tempo real.
- **API Externa REST & VoIP:** Endpoint `/api/v1/external` para identificação de chamadas telefônicas e integração n8n.
