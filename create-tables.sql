-- ==============================================================================
-- DDL DE CRIAÇÃO DAS TABELAS POSTGRESQL - GRÁFICA & PAPELARIA ERP CRM
-- Arquivo para execução via: psql -U postgres -d app_db -f create-tables.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Usuários e Operadores
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Operador',
    avatar_url TEXT,
    pin_code TEXT DEFAULT '1234',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. Clientes CRM (PF & PJ)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'PF',
    name TEXT NOT NULL,
    trade_name TEXT,
    nickname TEXT,
    client_status TEXT DEFAULT 'Liberado',
    document TEXT NOT NULL,
    state_registration TEXT,
    birth_date TEXT,
    gender TEXT,
    contact_person TEXT,
    origin_marketing TEXT,
    found_us TEXT,
    segment TEXT,
    zip_code TEXT,
    address TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    mobile TEXT,
    whatsapp TEXT,
    email TEXT NOT NULL,
    no_auto_whatsapp BOOLEAN DEFAULT false,
    promo_whatsapp BOOLEAN DEFAULT true,
    promo_email BOOLEAN DEFAULT true,
    info_call BOOLEAN DEFAULT true,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    tags TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3. Categorias de Impressora
CREATE TABLE IF NOT EXISTS printer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    technology TEXT NOT NULL DEFAULT 'laser',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. Impressoras e Máquinas Individuais
CREATE TABLE IF NOT EXISTS printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES printer_categories(id) ON DELETE CASCADE,
    category_name TEXT DEFAULT 'Laser Digital',
    name TEXT NOT NULL,
    brand TEXT DEFAULT 'Konica Minolta',
    model TEXT DEFAULT 'bizhub C284e',
    technology TEXT NOT NULL DEFAULT 'laser',
    max_sheet_width_mm INTEGER DEFAULT 330,
    max_sheet_height_mm INTEGER DEFAULT 488,
    toner_ink_set_cost NUMERIC(10, 2) DEFAULT 1200.00,
    yield_impressions INTEGER DEFAULT 18000,
    maintenance_cost_per_imp NUMERIC(8, 4) DEFAULT 0.0214,
    energy_cost_per_imp NUMERIC(8, 4) DEFAULT 0.0200,
    fixed_cost_per_imp NUMERIC(10, 4) DEFAULT 0.1341,
    coverage_percent NUMERIC(5, 2) DEFAULT 80.00,
    consumables_data JSONB,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 5. Materiais e Insumos de Produção
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'insumo',
    category TEXT NOT NULL DEFAULT 'paper',
    purchase_unit TEXT NOT NULL DEFAULT 'PCT',
    consumption_unit TEXT NOT NULL DEFAULT 'FLS',
    conversion_factor NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    stock_quantity NUMERIC(12, 2) DEFAULT 500.00,
    min_stock_quantity NUMERIC(12, 2) DEFAULT 100.00,
    purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 185.00,
    cost_price NUMERIC(10, 4) NOT NULL DEFAULT 1.85,
    ncm TEXT DEFAULT '4802.57.99',
    grammage TEXT,
    dimensions TEXT,
    finish_type TEXT,
    supplier TEXT DEFAULT 'Papelaria & Distribuidora Nacional',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 6. Acabamentos
CREATE TABLE IF NOT EXISTS finishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'unit',
    cost_price NUMERIC(10, 2) DEFAULT 0.20,
    sell_price NUMERIC(10, 2) DEFAULT 0.50,
    estimated_minutes INTEGER DEFAULT 2,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 7. Produtos e Ficha Técnica (BOM)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'grafica_rapida',
    description TEXT,
    sales_unit TEXT DEFAULT 'CT',
    printer_id UUID REFERENCES printers(id) ON DELETE SET NULL,
    paper_material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    default_yield_per_sheet INTEGER DEFAULT 24,
    yield_factor NUMERIC(10, 4) DEFAULT 0.0416,
    print_sides TEXT DEFAULT 'double',
    color_mode TEXT DEFAULT '4x4',
    production_time_minutes INTEGER DEFAULT 15,
    loss_margin_percent NUMERIC(5, 2) DEFAULT 5.00,
    tax_percent NUMERIC(5, 2) DEFAULT 6.00,
    card_tax_percent NUMERIC(5, 2) DEFAULT 3.16,
    target_margin_percent NUMERIC(5, 2) DEFAULT 60.00,
    hourly_labor_rate NUMERIC(10, 2) DEFAULT 45.00,
    calculated_base_cost NUMERIC(10, 4) DEFAULT 3.6500,
    cost_with_loss NUMERIC(10, 4) DEFAULT 3.8325,
    suggested_price NUMERIC(10, 2) DEFAULT 95.00,
    min_sell_price NUMERIC(10, 2) DEFAULT 85.00,
    override_sell_price NUMERIC(10, 2),
    composition_data JSONB,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 8. Orçamentos e Pedidos
CREATE TABLE IF NOT EXISTS quotes_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'quote',
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_document TEXT,
    client_phone TEXT,
    client_email TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    freight_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'pix',
    payment_status TEXT DEFAULT 'pending',
    infinite_pay_tx_id TEXT,
    infinite_pay_link TEXT,
    shipping_method TEXT DEFAULT 'pickup',
    shipping_tracking_code TEXT,
    shipping_label_url TEXT,
    shipping_address TEXT,
    art_approval_status TEXT DEFAULT 'pending',
    art_file_url TEXT,
    art_mockup_url TEXT,
    art_notes TEXT,
    art_rejection_reason TEXT,
    art_approved_at TIMESTAMP,
    notes TEXT,
    internal_tags TEXT,
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    operator_name TEXT DEFAULT 'Tiago Souza',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 9. Itens do Pedido
CREATE TABLE IF NOT EXISTS quote_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES quotes_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    width_mm INTEGER,
    height_mm INTEGER,
    sides TEXT,
    paper_material_name TEXT,
    finishes_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 10. Contas Financeiras
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'bank',
    account_number TEXT,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 11. Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'income',
    category TEXT NOT NULL DEFAULT 'Venda Balcão',
    cost_center TEXT DEFAULT 'Loja Física',
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    account_name TEXT NOT NULL DEFAULT 'Caixa Loja',
    due_date TIMESTAMP NOT NULL DEFAULT now(),
    payment_date TIMESTAMP,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'paid',
    payment_method TEXT DEFAULT 'PDV',
    order_id UUID REFERENCES quotes_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 12. Caixa PDV Turnos
CREATE TABLE IF NOT EXISTS pdv_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_name TEXT NOT NULL DEFAULT 'Tiago Souza',
    opening_balance NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    closing_balance NUMERIC(10, 2),
    cash_total NUMERIC(10, 2) DEFAULT 0.00,
    card_total NUMERIC(10, 2) DEFAULT 0.00,
    pix_total NUMERIC(10, 2) DEFAULT 0.00,
    opened_at TIMESTAMP NOT NULL DEFAULT now(),
    closed_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'open'
);

-- 13. Configurações do Sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 14. Templates de Comunicação Transacional
CREATE TABLE IF NOT EXISTS communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL DEFAULT 'whatsapp',
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    variables TEXT DEFAULT '[]',
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 15. Configuração WhatsApp Baileys
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_name TEXT DEFAULT 'Gráfica Baileys Principal',
    status TEXT DEFAULT 'connected',
    qr_code_url TEXT,
    connected_phone TEXT DEFAULT '+55 (21) 97886-9414',
    bot_enabled BOOLEAN NOT NULL DEFAULT true,
    bot_greeting_msg TEXT DEFAULT 'Olá! Bem-vindo à VTDIGITAL ART STUDIO.',
    bot_security_token TEXT DEFAULT 'grafica_sec_998127',
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 16. API Keys Externas
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    permissions TEXT DEFAULT 'read,write',
    active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
