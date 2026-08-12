-- Print Shop ERP v4 - Criação de Tabelas PostgreSQL
-- Execute com: psql -U postgres -d app_db -f create-tables.sql

-- Criar schema print_shop se não existir
CREATE SCHEMA IF NOT EXISTS print_shop;

-- 1. Users & Operators
CREATE TABLE IF NOT EXISTS print_shop.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Operador',
  avatar_url TEXT,
  pin_code TEXT DEFAULT '1234',
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Clients CRM (PF & PJ)
CREATE TABLE IF NOT EXISTS print_shop.clients (
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
  credit_limit NUMERIC(12, 2) DEFAULT '0.00',
  notes TEXT,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Printer Categories
CREATE TABLE IF NOT EXISTS print_shop.printer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  technology TEXT NOT NULL DEFAULT 'laser',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Printers
CREATE TABLE IF NOT EXISTS print_shop.printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES print_shop.printer_categories(id) ON DELETE CASCADE,
  category_name TEXT DEFAULT 'Laser Digital',
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'Konica Minolta',
  model TEXT DEFAULT 'bizhub C284e',
  technology TEXT NOT NULL DEFAULT 'laser',
  max_sheet_width_mm INTEGER DEFAULT 330,
  max_sheet_height_mm INTEGER DEFAULT 488,
  toner_ink_set_cost NUMERIC(10, 2) DEFAULT '1200.00',
  yield_impressions INTEGER DEFAULT 18000,
  maintenance_cost_per_imp NUMERIC(8, 4) DEFAULT '0.0214',
  energy_cost_per_imp NUMERIC(8, 4) DEFAULT '0.0200',
  fixed_cost_per_imp NUMERIC(10, 4) DEFAULT '0.1341',
  coverage_percent NUMERIC(5, 2) DEFAULT '80.00',
  consumables_data JSONB,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Materials
CREATE TABLE IF NOT EXISTS print_shop.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'insumo',
  category TEXT NOT NULL DEFAULT 'paper',
  purchase_unit TEXT NOT NULL DEFAULT 'PCT',
  consumption_unit TEXT NOT NULL DEFAULT 'FLS',
  conversion_factor NUMERIC(10, 2) NOT NULL DEFAULT '100.00',
  stock_quantity NUMERIC(12, 2) DEFAULT '500.00',
  min_stock_quantity NUMERIC(12, 2) DEFAULT '100.00',
  purchase_price NUMERIC(10, 2) NOT NULL DEFAULT '185.00',
  cost_price NUMERIC(10, 4) NOT NULL DEFAULT '1.85',
  ncm TEXT DEFAULT '4802.57.99',
  grammage TEXT,
  dimensions TEXT,
  finish_type TEXT,
  supplier TEXT DEFAULT 'Papelaria & Distribuidora Nacional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Finishes
CREATE TABLE IF NOT EXISTS print_shop.finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'unit',
  cost_price NUMERIC(10, 2) DEFAULT '0.20',
  sell_price NUMERIC(10, 2) DEFAULT '0.50',
  estimated_minutes INTEGER DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Products
CREATE TABLE IF NOT EXISTS print_shop.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'grafica_rapida',
  description TEXT,
  sales_unit TEXT DEFAULT 'CT',
  printer_id UUID REFERENCES print_shop.printers(id) ON DELETE SET NULL,
  paper_material_id UUID REFERENCES print_shop.materials(id) ON DELETE SET NULL,
  default_yield_per_sheet INTEGER DEFAULT 24,
  yield_factor NUMERIC(10, 4) DEFAULT '0.0416',
  print_sides TEXT DEFAULT 'double',
  color_mode TEXT DEFAULT '4x4',
  production_time_minutes INTEGER DEFAULT 15,
  loss_margin_percent NUMERIC(5, 2) DEFAULT '5.00',
  tax_percent NUMERIC(5, 2) DEFAULT '6.00',
  card_tax_percent NUMERIC(5, 2) DEFAULT '3.16',
  target_margin_percent NUMERIC(5, 2) DEFAULT '60.00',
  hourly_labor_rate NUMERIC(10, 2) DEFAULT '45.00',
  calculated_base_cost NUMERIC(10, 4) DEFAULT '3.6500',
  cost_with_loss NUMERIC(10, 4) DEFAULT '3.8325',
  suggested_price NUMERIC(10, 2) DEFAULT '95.00',
  min_sell_price NUMERIC(10, 2) DEFAULT '85.00',
  override_sell_price NUMERIC(10, 2),
  composition_data JSONB,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Quotes & Orders
CREATE TABLE IF NOT EXISTS print_shop.quotes_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'quote',
  client_id UUID REFERENCES print_shop.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_document TEXT,
  client_phone TEXT,
  client_email TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  freight_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
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
  operator_id UUID REFERENCES print_shop.users(id) ON DELETE SET NULL,
  operator_name TEXT DEFAULT 'Tiago Souza',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Quote Order Items
CREATE TABLE IF NOT EXISTS print_shop.quote_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES print_shop.quotes_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES print_shop.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10, 2) DEFAULT '0.00',
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT '0.00',
  total_price NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  width_mm INTEGER,
  height_mm INTEGER,
  sides TEXT,
  paper_material_name TEXT,
  finishes_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Financial Accounts
CREATE TABLE IF NOT EXISTS print_shop.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bank',
  account_number TEXT,
  balance NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Financial Transactions
CREATE TABLE IF NOT EXISTS print_shop.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'income',
  category TEXT NOT NULL DEFAULT 'Venda Balcão',
  cost_center TEXT DEFAULT 'Loja Física',
  account_id UUID REFERENCES print_shop.financial_accounts(id) ON DELETE SET NULL,
  account_name TEXT NOT NULL DEFAULT 'Caixa Loja',
  due_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  payment_date TIMESTAMP,
  amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  status TEXT NOT NULL DEFAULT 'paid',
  payment_method TEXT DEFAULT 'PDV',
  order_id UUID REFERENCES print_shop.quotes_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. PDV Cash Register Shifts
CREATE TABLE IF NOT EXISTS print_shop.pdv_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_name TEXT NOT NULL DEFAULT 'Tiago Souza',
  opening_balance NUMERIC(10, 2) NOT NULL DEFAULT '150.00',
  closing_balance NUMERIC(10, 2),
  cash_total NUMERIC(10, 2) DEFAULT '0.00',
  card_total NUMERIC(10, 2) DEFAULT '0.00',
  pix_total NUMERIC(10, 2) DEFAULT '0.00',
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  closed_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'open'
);

-- 13. System Settings
CREATE TABLE IF NOT EXISTS print_shop.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. Communication Templates
CREATE TABLE IF NOT EXISTS print_shop.communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT DEFAULT '[]',
  active BOOLEAN DEFAULT true NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 15. WhatsApp Config
CREATE TABLE IF NOT EXISTS print_shop.whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT DEFAULT 'Gráfica Baileys Principal',
  status TEXT DEFAULT 'connected',
  qr_code_url TEXT,
  connected_phone TEXT DEFAULT '+55 (11) 98877-6655',
  bot_enabled BOOLEAN DEFAULT true NOT NULL,
  bot_greeting_msg TEXT DEFAULT 'Olá! Bem-vindo à Gráfica & Papelaria Personalizada.',
  bot_security_token TEXT DEFAULT 'grafica_sec_998127',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 16. API Keys
CREATE TABLE IF NOT EXISTS print_shop.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  permissions TEXT DEFAULT 'read,write',
  active BOOLEAN DEFAULT true NOT NULL,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON print_shop.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_document ON print_shop.clients(document);
CREATE INDEX IF NOT EXISTS idx_products_code ON print_shop.products(code);
CREATE INDEX IF NOT EXISTS idx_quotes_orders_status ON print_shop.quotes_orders(status);
CREATE INDEX IF NOT EXISTS idx_quotes_orders_client_id ON print_shop.quotes_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON print_shop.users(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_instance ON print_shop.whatsapp_config(instance_name);

-- Tabelas criadas com sucesso!
-- Execute: SELECT * FROM information_schema.tables WHERE table_schema = 'print_shop';
