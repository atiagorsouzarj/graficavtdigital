# CHECKLIST ANTES DE ENVIAR ZIP / RELEASE DE ATUALIZAÇÃO

Utilize este checklist obrigatório antes de gerar qualquer arquivo ZIP, commit ou release para o repositório público do sistema ERP CRM.

---

## 📋 Checklist de Validação Pré-Release

### 1. Testes de Build e Compilação
- [x] Executar `npx next typegen` sem erros.
- [x] Executar `npm exec tsc -- --noEmit` com 0 erros de TypeScript.
- [x] Executar `npm run build` para garantir que o bundle de produção compila 100%.
- [x] Verificar se o endpoint `/api/health` responde com HTTP 200 OK (`{ "ok": true }`).

---

### 2. Estrutura do Banco de Dados PostgreSQL
- [x] Garantir que `create-tables.sql` contém o DDL atualizado de todas as 16 tabelas.
- [x] Testar a execução do SQL via:
  ```bash
  psql -U postgres -d app_db -f create-tables.sql
  ```
- [x] Verificar se todas as tabelas possuem as colunas requeridas (incluindo `phone` opcional em `clients` e `composition_data` em `products`).

---

### 3. Módulos e Funcionalidades Críticas
- [x] **Impressão 80mm e A4:**
  - Testar botão de impressão A4 no Orçamento (verificar que usa a classe `.printable-area-a4` e não sai em branco).
  - Testar botão de impressão do Cupom 80mm (verificar que inicia no topo da página e oculta a interface web).
- [x] **WhatsApp Baileys & QR Code:**
  - Garantir que `src/lib/whatsappService.ts` está presente.
  - Verificar a página dedicada `/qr-code` com código de pareamento.
  - Confirmar que a geração do QR Code roda nativamente em base64 Data URL no backend (`QRCode.toDataURL`).
- [x] **CRM Clientes:**
  - Testar cadastro de Pessoa Física e Jurídica.
  - Verificar máscaras de entrada ao digitar (CPF, CNPJ, CEP, Nascimento, Telefones).
  - Testar busca automática de endereço via ViaCEP.
- [x] **Demos do Banco de Dados:**
  - Confirmar pelo menos 6 registros de demonstração reais em cada um dos módulos (Clientes, Impressoras, Materiais, Acabamentos, Produtos, Pedidos, Contas Bancárias, Transações e Templates).

---

### 4. Arquivos e Documentação Obrigatórios
- [x] `LEIA-PRIMEIRO-v2.5.1.md`
- [x] `LEIA-PRIMEIRO.md`
- [x] `CHECKLIST-ANTES-DE-ENVIAR-ZIP.md`
- [x] `ATUALIZACOES.md`
- [x] `RESUMO.md`
- [x] `GUIA-INSTALACAO-DEBIAN.md`
- [x] `DOCUMENTACAO-SISTEMA.md`
- [x] `GUIA-WHATSAPP-BAILEYS.md`
- [x] `README.md`
- [x] `VERSION`
- [x] `CHANGELOG.md`
- [x] `scripts/update.sh`

---

## 🏷️ Comandos para Publicar Nova Release

```bash
git add .
git commit -m "feat(release): v2.6.4 - Pre-release validation and documentation complete"
git tag -f "v2.6.4" -m "Release v2.6.4 - Complete Print Shop ERP CRM System"
```
