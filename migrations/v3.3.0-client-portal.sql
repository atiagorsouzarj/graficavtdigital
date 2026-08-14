-- ============================================================================
-- MIGRAÇÃO v3.3.0 - Client Portal
-- Corrige: "Failed query: select ... art_approval_token, tracking_token ...
--           from quotes_orders where client_id = $1"
--
-- O erro acontece porque bancos criados com o create-tables.sql antigo não
-- possuem as colunas de tokens públicos em quotes_orders nem as tabelas do
-- Portal do Cliente (client_otps, client_sessions, client_activity_log,
-- gabaritos), que o schema Drizzle v3.3.0 espera.
--
-- Este script é IDEMPOTENTE: pode ser executado mais de uma vez sem erro.
--
-- Como aplicar:
--   psql -h 127.0.0.1 -U postgres -d app_db -f migrations/v3.3.0-client-portal.sql
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Colunas novas em quotes_orders (tokens de acesso público sem login)
-- ----------------------------------------------------------------------------
ALTER TABLE quotes_orders ADD COLUMN IF NOT EXISTS art_approval_token TEXT;
ALTER TABLE quotes_orders ADD COLUMN IF NOT EXISTS art_approval_token_expires_at TIMESTAMP;
ALTER TABLE quotes_orders ADD COLUMN IF NOT EXISTS tracking_token TEXT;
ALTER TABLE quotes_orders ADD COLUMN IF NOT EXISTS tracking_token_expires_at TIMESTAMP;

-- ----------------------------------------------------------------------------
-- 2. Client OTPs - códigos de acesso temporários (CPF/CNPJ + código por e-mail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    attempts INTEGER NOT NULL DEFAULT 0,
    blocked_until TIMESTAMP,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Client Sessions - sessões ativas dos clientes autenticados
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. Client Activity Log - auditoria de ações do portal do cliente
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    session_id UUID REFERENCES client_sessions(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. Gabaritos - galeria de templates para download
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gabaritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'outros',
    product_type TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_kb INTEGER DEFAULT 0,
    width_mm INTEGER,
    height_mm INTEGER,
    bleed_mm INTEGER DEFAULT 3,
    requires_auth BOOLEAN NOT NULL DEFAULT false,
    downloads INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. Índices úteis para o portal
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_client_otps_client_id ON client_otps(client_id);
CREATE INDEX IF NOT EXISTS idx_client_sessions_client_id ON client_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_log_client_id ON client_activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_orders_client_id ON quotes_orders(client_id);

COMMIT;

-- Verificação pós-migração (deve listar as 4 colunas novas):
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'quotes_orders' AND column_name IN
--  ('art_approval_token','art_approval_token_expires_at','tracking_token','tracking_token_expires_at');
