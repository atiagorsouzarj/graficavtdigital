# GUIA DE INSTALAÇÃO NO SERVIDOR DEBIAN LINUX

Instruções para deploy em servidor físico ou VPS com Debian 11/12.

## Requisitos Recomendados
- **Processador:** Intel Core i3 (4 Cores)
- **Memória RAM:** 12 GB
- **SSD:** 140 GB

---

## Passo a Passo

```bash
# 1. Atualizar o sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx postgresql postgresql-contrib

# 2. Instalar Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Configurar PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE app_db;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE app_db TO postgres;"

# 4. Clonar o projeto
cd /var/www
git clone https://github.com/atiagorsouzarj/graficavtdigital.git
cd graficavtdigital
git checkout v2.5.1

# 5. Instalar dependências e criar tabelas
npm install --legacy-peer-deps
psql -U postgres -d app_db -f create-tables.sql

# 6. Compilar e rodar PM2
npm run build
sudo npm install -g pm2
pm2 start npm --name "erp-grafica" -- start
pm2 save
pm2 startup
```
