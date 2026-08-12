"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  CreditCard,
  Truck,
  Mail,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Server,
  Zap,
  Sliders,
  Plus,
  Trash2,
  Info,
  Sparkles,
  Maximize2,
  Globe,
  UserCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("empresa");

  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: "PrintFlow Gráfica Criativa",
    company_trade_name: "PrintFlow Gráfica",
    company_cnpj: "12.345.678/0001-90",
    company_ie: "109.876.543.210",
    company_im: "987.654.321",
    company_regime: "Simples Nacional",
    company_cep: "01310-100",
    company_address: "Rua das Gráficas",
    company_number: "500",
    company_neighborhood: "Centro",
    company_city: "São Paulo",
    company_uf: "SP",
    company_phone: "(11) 4002-8922",
    company_whatsapp: "(11) 98877-6655",
    company_email: "contato@printflow.com.br",
    company_logo_url: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80",
    
    // Public Client Area Settings
    public_page_title: "Cadastro rápido. Orçamento na hora.",
    public_page_subtitle: "Preencha seus dados e receba um atendimento mais rápido.",
    public_banner_1_title: "DESTAQUE: Personalizados sob medida",
    public_banner_1_subtitle: "Gráfica rápida, brindes, papelaria e impressão 3D em alta definição.",
    public_banner_2_title: "DESTAQUE: Qualidade Impressão Konica & Sublimação",
    public_banner_2_subtitle: "Aprovamos a sua arte digital antes da impressão com entrega rápida.",
    public_banner_3_title: "DESTAQUE: Desconto no PIX & Faturamento PJ",
    public_banner_3_subtitle: "Facilidade de pagamento com cashback e faturamento corporativo.",
    public_auto_approve_clients: "true",

    // WhatsApp Baileys Settings
    whatsapp_instance_name: "Baileys Main Instance (Baileys v6.7.0)",
    whatsapp_phone: "+55 (21) 97886-9414",
    whatsapp_bot_enabled: "true",
    whatsapp_bot_token: "sec_token_grafica_9921",
    whatsapp_bot_greeting: "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",

    // SMTP Settings
    smtp_host: "smtp.printflow.com.br",
    smtp_port: "587",
    smtp_user: "vendas@printflow.com.br",
    smtp_pass: "••••••••••••",
    smtp_from_name: "PrintFlow Gráfica Criativa",

    // Gateways
    infinitepay_api_key: "inf_live_pk_89217389127389127391283",
    superfrete_token: "superfrete_tok_991283912839",

    // Comunicação Visual Supplier Prices
    cv_banner_price_m2: "35.00",
    cv_banner_min_price_under_1m2: "26.00",
    cv_adesivo_price_m2: "40.00",

    // DTF Supplier Base Prices (JSON String)
    dtf_supplier_prices: JSON.stringify({
      dtf_uv: [
        { id: "a4_uv", name: "A4 (28 × 19 cm)", cost: 49.0 },
        { id: "a3_uv", name: "A3 (28 × 40 cm)", cost: 79.0 },
        { id: "metro_uv", name: "Metro (28 × 100 cm)", cost: 99.0 },
      ],
      dtf_textil: [
        { id: "a4_textil", name: "A4 (38 × 25 cm)", cost: 34.9 },
        { id: "a3_textil", name: "A3 (38 × 50 cm)", cost: 54.9 },
        { id: "metro_textil", name: "Metro (38 × 100 cm)", cost: 84.9 },
      ],
    }),
  });

  // DTF Supplier Prices parsed object
  const [dtfPrices, setDtfPrices] = useState<{
    dtf_uv: Array<{ id: string; name: string; cost: number }>;
    dtf_textil: Array<{ id: string; name: string; cost: number }>;
  }>({
    dtf_uv: [
      { id: "a4_uv", name: "A4 (28 × 19 cm)", cost: 49.0 },
      { id: "a3_uv", name: "A3 (28 × 40 cm)", cost: 79.0 },
      { id: "metro_uv", name: "Metro (28 × 100 cm)", cost: 99.0 },
    ],
    dtf_textil: [
      { id: "a4_textil", name: "A4 (38 × 25 cm)", cost: 34.9 },
      { id: "a3_textil", name: "A3 (38 × 50 cm)", cost: 54.9 },
      { id: "metro_textil", name: "Metro (38 × 100 cm)", cost: 84.9 },
    ],
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.map) {
          setSettings((prev) => ({ ...prev, ...data.map }));
          if (data.map.company_logo_url) {
            setLogoPreview(data.map.company_logo_url);
          }
          if (data.map.dtf_supplier_prices) {
            try {
              const parsed = JSON.parse(data.map.dtf_supplier_prices);
              setDtfPrices(parsed);
            } catch {
              // fallback
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: Record<string, string> = {
      ...settings,
      dtf_supplier_prices: JSON.stringify(dtfPrices),
    };

    const payload = Object.keys(updatedSettings).map((key) => ({
      key,
      value: updatedSettings[key],
    }));

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
    if (key === "company_logo_url") setLogoPreview(value);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        updateSetting("company_logo_url", base64Url);
        setLogoPreview(base64Url);
      };
      reader.readAsDataURL(file);
    }
  };

  // DTF Price Table Item Handler
  const handleDtfPriceChange = (
    type: "dtf_uv" | "dtf_textil",
    idx: number,
    field: "name" | "cost",
    val: string
  ) => {
    const list = [...dtfPrices[type]];
    if (list[idx]) {
      if (field === "cost") {
        list[idx].cost = parseFloat(val) || 0;
      } else {
        list[idx].name = val;
      }
      setDtfPrices({ ...dtfPrices, [type]: list });
    }
  };

  const handleAddDtfFormat = (type: "dtf_uv" | "dtf_textil") => {
    const newItem = {
      id: `${type}_${Date.now()}`,
      name: "Novo Formato Personalizado",
      cost: 50.0,
    };
    setDtfPrices({ ...dtfPrices, [type]: [...dtfPrices[type], newItem] });
  };

  const handleRemoveDtfFormat = (type: "dtf_uv" | "dtf_textil", idx: number) => {
    const list = dtfPrices[type].filter((_, i) => i !== idx);
    setDtfPrices({ ...dtfPrices, [type]: list });
  };

  return (
    <MainLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            ADMINISTRAÇÃO DO SISTEMA
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Controle de Módulos</h1>
          <p className="text-xs text-slate-500">
            Configure dados fiscais, página de cadastro público, tabela de custos dos fornecedores, credenciais WhatsApp e e-mail.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> Configurações atualizadas e salvas com sucesso no sistema!
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 text-xs font-bold shadow-2xs">
          {[
            { id: "empresa", label: "Dados da Empresa & Fiscais", icon: Building },
            { id: "public_area", label: "🌐 Área do Cliente & Página Pública", icon: Globe },
            { id: "cv", label: "Tabela Comunicação Visual (m²)", icon: Maximize2 },
            { id: "dtf", label: "Tabela de Preços DTF (Fornecedor)", icon: Zap },
            { id: "whatsapp", label: "WhatsApp & Bot Baileys", icon: MessageSquare },
            { id: "smtp", label: "E-mail Transacional & SMTP", icon: Server },
            { id: "gateways", label: "InfinitePay & SuperFrete", icon: CreditCard },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === t.id
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* TAB 1: DADOS DA EMPRESA & FISCAIS */}
          {activeTab === "empresa" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Building className="w-5 h-5 text-sky-600" /> Dados Corporativos, Logo & Parâmetros Fiscais
                </h3>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  Pronto para Emissão NF-e
                </span>
              </div>

              {/* Logo Upload Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-700 block uppercase text-[10px]">
                  LOGOMARCA DA EMPRESA (IMPRESSA NOS COMPROVANTES E PROPOSTAS PDF)
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {logoPreview ? (
                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo da Empresa"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-200 border border-dashed border-slate-300 shrink-0 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Fazer Upload da Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            updateSetting("company_logo_url", "");
                          }}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                        Ou informe o Link/URL da Imagem da Logo:
                      </label>
                      <input
                        type="text"
                        value={settings.company_logo_url || ""}
                        onChange={(e) => updateSetting("company_logo_url", e.target.value)}
                        placeholder="https://suaempresa.com.br/logo.png"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={settings.company_name || ""}
                    onChange={(e) => updateSetting("company_name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={settings.company_trade_name || ""}
                    onChange={(e) => updateSetting("company_trade_name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={settings.company_cnpj || ""}
                    onChange={(e) => updateSetting("company_cnpj", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    value={settings.company_ie || ""}
                    onChange={(e) => updateSetting("company_ie", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inscrição Municipal (IM)</label>
                  <input
                    type="text"
                    value={settings.company_im || ""}
                    onChange={(e) => updateSetting("company_im", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Regime Tributário</label>
                  <select
                    value={settings.company_regime || "Simples Nacional"}
                    onChange={(e) => updateSetting("company_regime", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold outline-hidden"
                  >
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="MEI">MEI (Microempreendedor)</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ÁREA DO CLIENTE & PÁGINA PÚBLICA */}
          {activeTab === "public_area" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-600" /> Configuração da Página de Cadastro Público (`/cadastro-publico`)
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Personalize os títulos, banners promocionais rotativos e regras de aprovação para os clientes que se cadastram pelo link público.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Título Principal da Página</label>
                <input
                  type="text"
                  value={settings.public_page_title || "Cadastro rápido. Orçamento na hora."}
                  onChange={(e) => updateSetting("public_page_title", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtítulo Exibido</label>
                <input
                  type="text"
                  value={settings.public_page_subtitle || "Preencha seus dados e receba um atendimento mais rápido."}
                  onChange={(e) => updateSetting("public_page_subtitle", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 outline-hidden"
                />
              </div>

              {/* 3 Rotative Banners */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[10px] block">
                  CONFIGURAÇÃO DOS 3 BANNERS ROTATIVOS (CARROSSEL ÁREA DO CLIENTE)
                </span>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-sky-700 block font-bold">Banner 1:</strong>
                    <input
                      type="text"
                      value={settings.public_banner_1_title || "DESTAQUE: Personalizados sob medida"}
                      onChange={(e) => updateSetting("public_banner_1_title", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold outline-hidden"
                    />
                    <input
                      type="text"
                      value={settings.public_banner_1_subtitle || "Gráfica rápida, brindes, papelaria e impressão 3D."}
                      onChange={(e) => updateSetting("public_banner_1_subtitle", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-600 outline-hidden"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-purple-700 block font-bold">Banner 2:</strong>
                    <input
                      type="text"
                      value={settings.public_banner_2_title || "DESTAQUE: Qualidade Impressão Konica & Sublimação"}
                      onChange={(e) => updateSetting("public_banner_2_title", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold outline-hidden"
                    />
                    <input
                      type="text"
                      value={settings.public_banner_2_subtitle || "Aprovamos a sua arte digital antes da impressão."}
                      onChange={(e) => updateSetting("public_banner_2_subtitle", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-600 outline-hidden"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-emerald-700 block font-bold">Banner 3:</strong>
                    <input
                      type="text"
                      value={settings.public_banner_3_title || "DESTAQUE: Desconto no PIX & Faturamento PJ"}
                      onChange={(e) => updateSetting("public_banner_3_title", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold outline-hidden"
                    />
                    <input
                      type="text"
                      value={settings.public_banner_3_subtitle || "Facilidade de pagamento e faturamento corporativo."}
                      onChange={(e) => updateSetting("public_banner_3_subtitle", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMUNICAÇÃO VISUAL */}
          {activeTab === "cv" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-sky-600" /> Tabela de Custo do Fornecedor — Comunicação Visual (m²)
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Configure os preços de custo por m² de Banner e Adesivos cobrados pelo fornecedor terceirizado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-extrabold text-slate-800 text-xs block">Banner — Custo m² (Fornecedor)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.cv_banner_price_m2 || "35.00"}
                    onChange={(e) => updateSetting("cv_banner_price_m2", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sky-800 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block">Preço de custo para banners &ge; 1,0 m²</span>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                  <span className="font-extrabold text-amber-900 text-xs block">Banner — Trava Mínima (&lt; 1 m²)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.cv_banner_min_price_under_1m2 || "26.00"}
                    onChange={(e) => updateSetting("cv_banner_min_price_under_1m2", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-amber-900 outline-hidden"
                  />
                  <span className="text-[10px] text-amber-800 block">Valor fixo de custo se a peça for menor que 1,0 m²</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-extrabold text-slate-800 text-xs block">Adesivo Vinil — Custo m² (Fornecedor)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.cv_adesivo_price_m2 || "40.00"}
                    onChange={(e) => updateSetting("cv_adesivo_price_m2", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sky-800 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block">Preço de custo do m² para lote de adesivos</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TABELA DE PREÇOS DTF (FORNECEDOR) */}
          {activeTab === "dtf" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" /> Tabela de Preços e Tamanhos de DTF (Custo do Fornecedor)
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Estes são os valores de custo cobrados pela empresa terceirizada de DTF.
                  </p>
                </div>
              </div>

              {/* DTF UV Supplier Prices Table */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                  <span className="font-extrabold text-purple-900 text-xs uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Tabela de Custo DTF UV (Fornecedor)
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddDtfFormat("dtf_uv")}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Novo Tamanho DTF UV
                  </button>
                </div>

                <div className="space-y-2">
                  {dtfPrices.dtf_uv.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-2.5 bg-white rounded-xl border border-purple-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <label className="text-[9px] text-slate-400 block font-bold">Formato / Tamanho</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleDtfPriceChange("dtf_uv", idx, "name", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden focus:bg-white"
                        />
                      </div>

                      <div className="w-36">
                        <label className="text-[9px] text-slate-400 block font-bold">Custo Fornecedor (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.cost}
                          onChange={(e) => handleDtfPriceChange("dtf_uv", idx, "cost", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono font-extrabold text-purple-800 outline-hidden focus:bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDtfFormat("dtf_uv", idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer mt-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DTF Têxtil Supplier Prices Table */}
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <span className="font-extrabold text-sky-900 text-xs uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" /> Tabela de Custo DTF TÊXTIL (Fornecedor)
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddDtfFormat("dtf_textil")}
                    className="px-3 py-1 bg-sky-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Novo Tamanho DTF Têxtil
                  </button>
                </div>

                <div className="space-y-2">
                  {dtfPrices.dtf_textil.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-2.5 bg-white rounded-xl border border-sky-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <label className="text-[9px] text-slate-400 block font-bold">Formato / Tamanho</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleDtfPriceChange("dtf_textil", idx, "name", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden focus:bg-white"
                        />
                      </div>

                      <div className="w-36">
                        <label className="text-[9px] text-slate-400 block font-bold">Custo Fornecedor (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.cost}
                          onChange={(e) => handleDtfPriceChange("dtf_textil", idx, "cost", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono font-extrabold text-sky-800 outline-hidden focus:bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDtfFormat("dtf_textil", idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer mt-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHATSAPP & BOT BAILEYS */}
          {activeTab === "whatsapp" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Bridge Baileys & Robô de Suporte
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome da Instância Baileys</label>
                  <input
                    type="text"
                    value={settings.whatsapp_instance_name || "Baileys Main Instance (Baileys v6.7.0)"}
                    onChange={(e) => updateSetting("whatsapp_instance_name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número Conectado</label>
                  <input
                    type="text"
                    value={settings.whatsapp_phone || "+55 (21) 97886-9414"}
                    onChange={(e) => updateSetting("whatsapp_phone", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-emerald-700 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" /> Salvar Configurações do Módulo
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
