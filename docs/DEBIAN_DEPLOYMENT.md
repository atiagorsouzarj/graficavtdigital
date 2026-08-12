# Guia de Instalação e Deploy em Servidor Debian Linux

Sistema ERP CRM & Precificação para Gráfica Rápida e Papelaria Personalizada.

## Requisitos do Servidor

- **Sistema Operacional:** Debian 11 / 12 (64-bit)
- **Processador:** Intel Core i3 (4 Cores)
- **Memória RAM:** 12 GB RAM
- **Armazenamento:** 140 GB SSD

---

## 1. Preparação do Servidor Debian

Acesse seu servidor via SSH:
```bash
ssh root@SEU_IP_SERVIDOR
```

Atualize os pacotes do sistema:
```bash
apt update && apt upgrade -y
apt install -y curl wget git build-essential nginx postgresql postgresql-contrib
```

---

## 2. Instalação do Node.js (v20+ LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v # Deve exibir v20.x.x
```

---

## 3. Configuração do PostgreSQL

Acesse o PostgreSQL e crie o banco de dados e usuário:
```bash
sudo -u postgres psql
```

No terminal do psql:
```sql
CREATE DATABASE grafica_db;
CREATE USER grafica_user WITH PASSWORD 'SuaSenhaSegura123';
GRANT ALL PRIVILEGES ON DATABASE grafica_db TO grafica_user;
\q
```

---

## 4. Clonar Repositório e Configurar `.env`

```bash
cd /var/www
git clone https://seu-repositorio.git grafica-erp
cd grafica-erp

# Criar arquivo .env
cat <<EOT > .env
DATABASE_URL="postgresql://grafica_user:SuaSenhaSegura123@127.0.0.1:5432/grafica_db"
NEXT_PUBLIC_APP_URL="https://grafica.suaempresa.com.br"
EOT

# Instalar dependências
npm install

# Subir tabela no PostgreSQL via Drizzle Kit
npx drizzle-kit push

# Compilar para produção
npm run build
```

---

## 5. Configurar Serviço PM2 (Gerenciador de Processos)

```bash
npm install -g pm2
pm2 start npm --name "grafica-erp" -- start
pm2 save
pm2 startup
```

---

## 6. Configurar Nginx com Proxy Reverso

Crie o arquivo de configuração do Nginx:
```bash
nano /etc/nginx/sites-available/grafica
```

Cole a configuração:
```nginx
server {
    listen 80;
    server_name grafica.suaempresa.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
ln -s /etc/nginx/sites-available/grafica /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 7. Script de Atualização Futura (`scripts/update.sh`)

Para atualizar o sistema com novas versões do Git:
```bash
chmod +x scripts/update.sh
./scripts/update.sh
```

---

## 8. Endpoints da API Externa para VOIP e Automação

- **Identificação VOIP Chamadas:** `GET /api/v1/external?action=voip_lookup&phone=11987654321`
- **Lista de Pedidos:** `GET /api/v1/external?action=list_orders`
- **Header Autenticação:** `X-API-Key: gk_voip_89127391827391287319`
