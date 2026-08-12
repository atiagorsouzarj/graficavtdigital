# GUIA WHATSAPP BAILEYS & BOT DE AUTOATENDIMENTO

O sistema conta com integração nativa com a biblioteca **Baileys WebSockets Bridge** para conexão via QR Code e disparo de mensagens transacionais.

---

## 📲 Como Parear seu WhatsApp

1. Acesse no navegador: `http://SEU_IP:3000/qr-code` (ou `/whatsapp`).
2. Clique no botão **`Gerar Novo QR Code`**.
3. Abra o WhatsApp no celular da empresa.
4. Vá em **Configurações ➔ Aparelhos Conectados ➔ Conectar um aparelho**.
5. Aponte a câmera para o QR Code gerado na tela ou use o **Código de Pareamento**.

---

## 🤖 Funcionamento do Bot de Suporte

O bot responde automaticamente quando o cliente escolhe as opções de menu:
- `1`: Informações para envio de orçamento.
- `2`: Link direto para o Portal de Aprovação de Arte Digital.
- `3` ou `Código PV`: Consulta instantânea do status do pedido no banco de dados.
- `4`: Transferência para atendimento humano.

---

## 🔔 Mensagens Transacionais do Kanban

Quando um pedido muda de status no Kanban, o sistema aciona o template transacional correspondente no WhatsApp do cliente:
- `art_approval`: Envia link de validação da prova digital.
- `in_printing`: Informa início da impressão.
- `ready_for_pickup`: Notifica que o pedido está pronto para retirada no balcão.
