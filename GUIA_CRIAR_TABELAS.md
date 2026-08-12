# Guia: Criação Manual das Tabelas PostgreSQL

**Solução:** Execute o script SQL gerado automaticamente (`create-tables.sql`) diretamente no PostgreSQL.

---

## 🚀 Como Executar

```bash
psql -U postgres -d app_db -f create-tables.sql
```

## 📊 16 Tabelas Criadas

1. `users`
2. `clients`
3. `printer_categories`
4. `printers`
5. `materials`
6. `finishes`
7. `products`
8. `quotes_orders`
9. `quote_order_items`
10. `financial_accounts`
11. `financial_transactions`
12. `pdv_shifts`
13. `system_settings`
14. `communication_templates`
15. `whatsapp_config`
16. `api_keys`
