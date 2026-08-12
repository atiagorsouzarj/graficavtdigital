# ATUALIZACÕES - Histórico de Revisões do Sistema

## Versão 2.6.2 (Atual)

- **Impressão Térmica de 80mm:** Adicionadas regras estritas de CSS `@media print` para forçar largura de 78mm e ocultar o restante da página web durante a impressão.
- **Recibo Térmico Físico (Foto 3):** Ajustado o layout do cupom não fiscal para corresponder ponto por ponto ao comprovante impresso da VTDIGITAL ART STUDIO.
- **Relatório de Ordem de Produção A4 (Foto 1):** Ajustado o layout da proposta comercial e ordem de produção A4.
- **Eliminação de Erro no QR Code WhatsApp:** Implementada a geração nativa de QR Code em formato base64 Data URL PNG no backend Node.js (`QRCode.toDataURL(...)`), sem dependência externa.
- **Validação de Documentos no CRM:** Adicionadas máscaras de entrada em tempo real para CPF, CNPJ, Data de Nascimento, CEP e Telefones.
- **Dropping NOT NULL Constraint:** Tornada opcional a coluna `phone` para evitar falhas ao cadastrar clientes informando apenas Celular/WhatsApp.
- **Arquivo `create-tables.sql`:** Adicionado dump SQL para inicialização em PostgreSQL.
