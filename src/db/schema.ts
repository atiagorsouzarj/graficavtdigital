import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { uuid } from "./uuid";

// 1. Users & Operators
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("Operador"),
  avatarUrl: text("avatar_url"),
  pinCode: text("pin_code").default("1234"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Clients CRM (PF & PJ)
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull().default("PF"), // 'PF' or 'PJ'
  name: text("name").notNull(), // Nome Completo or Razão Social
  tradeName: text("trade_name"), // Nome Fantasia (PJ)
  nickname: text("nickname"), // Apelido (PF)
  clientStatus: text("client_status").default("Liberado"), // 'Liberado', 'Bloqueado', 'Especial', 'VIP'
  
  document: text("document").notNull(), // CPF or CNPJ
  stateRegistration: text("state_registration"), // Inscrição Estadual (PJ)
  birthDate: text("birth_date"), // Data de Nascimento (PF)
  gender: text("gender"), // Sexo (PF)
  
  contactPerson: text("contact_person"),
  originMarketing: text("origin_marketing"), // Origem / Marketing
  foundUs: text("found_us"), // Onde nos encontrou
  segment: text("segment"), // Segmento (PJ)
  
  // Endereço (ViaCEP)
  zipCode: text("zip_code"),
  address: text("address"), // Nome da Rua / Avenida
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  
  // Contatos
  phone: text("phone"), // Telefone fixo (Opcional)
  mobile: text("mobile"), // Nº Celular
  whatsapp: text("whatsapp"),
  email: text("email").notNull(),
  
  // Regras de Contato e Comunicação
  noAutoWhatsapp: boolean("no_auto_whatsapp").default(false),
  promoWhatsapp: boolean("promo_whatsapp").default(true),
  promoEmail: boolean("promo_email").default(true),
  infoCall: boolean("info_call").default(true),
  
  creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).default("0.00"),
  notes: text("notes"),
  tags: text("tags"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Printer Categories
export const printerCategories = pgTable("printer_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  technology: text("technology").notNull().default("laser"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Individual Printers / Machines
export const printers = pgTable("printers", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => printerCategories.id, { onDelete: "cascade" }),
  categoryName: text("category_name").default("Laser Digital"),
  name: text("name").notNull(),
  brand: text("brand").default("Konica Minolta"),
  model: text("model").default("bizhub C284e"),
  technology: text("technology").notNull().default("laser"),
  maxSheetWidthMm: integer("max_sheet_width_mm").default(330),
  maxSheetHeightMm: integer("max_sheet_height_mm").default(488),
  tonerInkSetCost: numeric("toner_ink_set_cost", { precision: 10, scale: 2 }).default("1200.00"),
  yieldImpressions: integer("yield_impressions").default(18000),
  maintenanceCostPerImp: numeric("maintenance_cost_per_imp", { precision: 8, scale: 4 }).default("0.0214"),
  energyCostPerImp: numeric("energy_cost_per_imp", { precision: 8, scale: 4 }).default("0.0200"),
  fixedCostPerImp: numeric("fixed_cost_per_imp", { precision: 10, scale: 4 }).default("0.1341"),
  coveragePercent: numeric("coverage_percent", { precision: 5, scale: 2 }).default("80.00"),
  consumablesData: jsonb("consumables_data"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Materials & Insumos
export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  itemType: text("item_type").notNull().default("insumo"),
  category: text("category").notNull().default("paper"),
  purchaseUnit: text("purchase_unit").notNull().default("PCT"),
  consumptionUnit: text("consumption_unit").notNull().default("FLS"),
  conversionFactor: numeric("conversion_factor", { precision: 10, scale: 2 }).notNull().default("100.00"),
  stockQuantity: numeric("stock_quantity", { precision: 12, scale: 2 }).default("500.00"),
  minStockQuantity: numeric("min_stock_quantity", { precision: 12, scale: 2 }).default("100.00"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull().default("185.00"),
  costPrice: numeric("cost_price", { precision: 10, scale: 4 }).notNull().default("1.85"),
  ncm: text("ncm").default("4802.57.99"),
  grammage: text("grammage"),
  dimensions: text("dimensions"),
  finishType: text("finish_type"),
  supplier: text("supplier").default("Papelaria & Distribuidora Nacional"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 6. Finishes
export const finishes = pgTable("finishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  unit: text("unit").notNull().default("unit"),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).default("0.20"),
  sellPrice: numeric("sell_price", { precision: 10, scale: 2 }).default("0.50"),
  estimatedMinutes: integer("estimated_minutes").default(2),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Products & Dynamic Pricing Composition Engine (Ficha Técnica BOM)
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default("grafica_rapida"),
  description: text("description"),
  salesUnit: text("sales_unit").default("CT"),
  
  printerId: uuid("printer_id").references(() => printers.id, { onDelete: "set null" }),
  paperMaterialId: uuid("paper_material_id").references(() => materials.id, { onDelete: "set null" }),
  
  defaultYieldPerSheet: integer("default_yield_per_sheet").default(24),
  yieldFactor: numeric("yield_factor", { precision: 10, scale: 4 }).default("0.0416"),
  printSides: text("print_sides").default("double"),
  colorMode: text("color_mode").default("4x4"),
  productionTimeMinutes: integer("production_time_minutes").default(15),
  
  lossMarginPercent: numeric("loss_margin_percent", { precision: 5, scale: 2 }).default("5.00"),
  taxPercent: numeric("tax_percent", { precision: 5, scale: 2 }).default("6.00"),
  cardTaxPercent: numeric("card_tax_percent", { precision: 5, scale: 2 }).default("3.16"),
  targetMarginPercent: numeric("target_margin_percent", { precision: 5, scale: 2 }).default("60.00"),
  hourlyLaborRate: numeric("hourly_labor_rate", { precision: 10, scale: 2 }).default("45.00"),
  
  calculatedBaseCost: numeric("calculated_base_cost", { precision: 10, scale: 4 }).default("3.6500"),
  costWithLoss: numeric("cost_with_loss", { precision: 10, scale: 4 }).default("3.8325"),
  suggestedPrice: numeric("suggested_price", { precision: 10, scale: 2 }).default("95.00"),
  minSellPrice: numeric("min_sell_price", { precision: 10, scale: 2 }).default("85.00"),
  overrideSellPrice: numeric("override_sell_price", { precision: 10, scale: 2 }),
  
  compositionData: jsonb("composition_data"),
  
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8. Quotes & Orders
export const quotesOrders = pgTable("quotes_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("quote"),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  clientName: text("client_name").notNull(),
  clientDocument: text("client_document"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  status: text("status").notNull().default("draft"),
  subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  freightAmount: numeric("freight_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  paymentMethod: text("payment_method").default("pix"),
  paymentStatus: text("payment_status").default("pending"),
  infinitePayTxId: text("infinite_pay_tx_id"),
  infinitePayLink: text("infinite_pay_link"),
  shippingMethod: text("shipping_method").default("pickup"),
  shippingTrackingCode: text("shipping_tracking_code"),
  shippingLabelUrl: text("shipping_label_url"),
  shippingAddress: text("shipping_address"),
  artApprovalStatus: text("art_approval_status").default("pending"),
  artFileUrl: text("art_file_url"),
  artMockupUrl: text("art_mockup_url"),
  artNotes: text("art_notes"),
  artRejectionReason: text("art_rejection_reason"),
  artApprovedAt: timestamp("art_approved_at"),
  notes: text("notes"),
  internalTags: text("internal_tags"),
  operatorId: uuid("operator_id").references(() => users.id, { onDelete: "set null" }),
  operatorName: text("operator_name").default("Tiago Souza"),
  // Single-use tokens for public access (sem login)
  artApprovalToken: text("art_approval_token"),
  artApprovalTokenExpiresAt: timestamp("art_approval_token_expires_at"),
  trackingToken: text("tracking_token"),
  trackingTokenExpiresAt: timestamp("tracking_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8b. Client OTP - Códigos de acesso temporários (CPF + código por e-mail)
export const clientOtps = pgTable("client_otps", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  codeHash: text("code_hash").notNull(),
  channel: text("channel").notNull().default("email"),
  attempts: integer("attempts").notNull().default(0),
  blockedUntil: timestamp("blocked_until"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8c. Client Sessions - Sessões ativas dos clientes autenticados
export const clientSessions = pgTable("client_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  refreshExpiresAt: timestamp("refresh_expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8d. Client Activity Log - Auditoria
export const clientActivityLog = pgTable("client_activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  sessionId: uuid("session_id").references(() => clientSessions.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Order Items
export const quoteOrderItems = pgTable("quote_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => quotesOrders.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).default("0.00"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  widthMm: integer("width_mm"),
  heightMm: integer("height_mm"),
  sides: text("sides"),
  paperMaterialName: text("paper_material_name"),
  finishesNotes: text("finishes_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Financial Accounts
export const financialAccounts = pgTable("financial_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull().default("bank"),
  accountNumber: text("account_number"),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Financial Transactions
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("income"),
  category: text("category").notNull().default("Venda Balcão"),
  costCenter: text("cost_center").default("Loja Física"),
  accountId: uuid("account_id").references(() => financialAccounts.id, { onDelete: "set null" }),
  accountName: text("account_name").notNull().default("Caixa Loja"),
  dueDate: timestamp("due_date").defaultNow().notNull(),
  paymentDate: timestamp("payment_date"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("paid"),
  paymentMethod: text("payment_method").default("PDV"),
  orderId: uuid("order_id").references(() => quotesOrders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. PDV Cash Register Shifts
export const pdvShifts = pgTable("pdv_shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  operatorName: text("operator_name").notNull().default("Tiago Souza"),
  openingBalance: numeric("opening_balance", { precision: 10, scale: 2 }).notNull().default("150.00"),
  closingBalance: numeric("closing_balance", { precision: 10, scale: 2 }),
  cashTotal: numeric("cash_total", { precision: 10, scale: 2 }).default("0.00"),
  cardTotal: numeric("card_total", { precision: 10, scale: 2 }).default("0.00"),
  pixTotal: numeric("pix_total", { precision: 10, scale: 2 }).default("0.00"),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  status: text("status").notNull().default("open"),
});

// 13. System Settings
export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 14. Transactional Messaging Templates
export const communicationTemplates = pgTable("communication_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  channel: text("channel").notNull().default("whatsapp"),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  variables: text("variables").default("[]"),
  active: boolean("active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 15. WhatsApp Baileys Config
export const whatsappConfig = pgTable("whatsapp_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  instanceName: text("instance_name").default("Gráfica Baileys Principal"),
  status: text("status").default("connected"),
  qrCodeUrl: text("qr_code_url"),
  connectedPhone: text("connected_phone").default("+55 (11) 98877-6655"),
  botEnabled: boolean("bot_enabled").default(true).notNull(),
  botGreetingMsg: text("bot_greeting_msg").default("Olá! Bem-vindo à Gráfica & Papelaria Personalizada."),
  botSecurityToken: text("bot_security_token").default("grafica_sec_998127"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 16. External API Keys
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: text("permissions").default("read,write"),
  active: boolean("active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 17. Gabaritos / Templates para Download (público no portal, gerenciado no /configuracoes)
export const gabaritos = pgTable("gabaritos", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // ex: "cartao-visita-cdr"
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("outros"), // "cartao-visita", "banner", "adesivo", "sublimacao", "comunicacao-visual", "outros"
  productType: text("product_type"), // opcional: vincula a um product
  fileUrl: text("file_url").notNull(), // caminho ou URL
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // "pdf" | "cdr" | "ai" | "psd" | "jpg" | "png" | "svg"
  fileSizeKb: integer("file_size_kb").default(0),
  widthMm: integer("width_mm"), // dimensões físicas (opcional)
  heightMm: integer("height_mm"),
  bleedMm: integer("bleed_mm").default(3),
  requiresAuth: boolean("requires_auth").default(false).notNull(), // se true, só cliente logado baixa
  downloads: integer("downloads").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
