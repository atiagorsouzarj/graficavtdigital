# LEIA PRIMEIRO - Guia Rápido de Instalação (v2.5.1)

Seja bem-vindo ao **Sistema ERP, CRM e Precificação para Gráfica Rápida e Papelaria Personalizada**.

---

## 🚀 Passos para Clonar e Instalar em 3 Minutos

```bash
# 1. Clonar o repositório
git clone https://github.com/atiagorsouzarj/graficavtdigital.git
cd graficavtdigital
git checkout v2.5.1

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Criar e aplicar tabelas no PostgreSQL
psql -U postgres -d app_db -f create-tables.sql

# 4. Compilar aplicação Next.js
npm run build

# 5. Iniciar o servidor com PM2 ou npm
pm2 restart erp-grafica || npm run start
```

---

## 📌 Arquivos Importantes Incluídos

1. `create-tables.sql`: Script DDL SQL de criação de todas as 16 tabelas no PostgreSQL.
2. `src/lib/whatsappService.ts`: Serviço de integração Baileys WebSockets e mensagens transacionais.
3. `src/app/qr-code/page.tsx`: Página visual dedicada para escaneamento e conexão do QR Code.
4. `DOCUMENTACAO-SISTEMA.md`: Documentação técnica de todos os módulos.
5. `GUIA-INSTALACAO-DEBIAN.md`: Passo a passo para servidores Debian Linux (4 Cores i3, 12GB RAM, 140GB SSD).
6. `GUIA-WHATSAPP-BAILEYS.md`: Guia de pareamento de QR Code e mensagens transacionais do Kanban.
7. `RESUMO.md`: Resumo executivo das funcionalidades do sistema.

---

## ⚙️ Acesso e Credenciais Iniciais

- **URL do Sistema:** `http://localhost:3000` (ou o IP do seu servidor Debian)
- **Página de QR Code do WhatsApp:** `http://localhost:3000/qr-code`
- **Operador Padrão:** Tiago Souza (`tiago@vtdigital.com.br`)
- **PIN de Acesso PDV:** `1234`
