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
  Download,
  Percent,
  FileCode2,
  Sparkles,
  Bot,
} from "lucide-react";

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
    
    // WhatsApp Baileys Settings
    whatsapp_instance_name: "Baileys Main Instance (Baileys v6.7.0)",
    whatsapp_phone: "+55 (11) 98877-6655",
    whatsapp_bot_enabled: "true",
    whatsapp_bot_token: "sec_token_grafica_9921",
    whatsapp_bot_greeting: "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",

    // SMTP Settings
    smtp_host: "smtp.printflow.com.br",
    smtp_port: "587",
    smtp_user: "vendas@printflow.com.br",
    smtp_pass: "••••••••••••",
    smtp_from_name: "PrintFlow Gráfica Criativa",
    smtp_from_email: "vendas@printflow.com.br",
    smtp_encryption: "TLS",

    // Gateways
    infinitepay_api_key: "inf_live_pk_89217389127389127391283",
    superfrete_token: "superfrete_tok_991283912839",
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
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.keys(settings).map((key) => ({
      key,
      value: settings[key],
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

  return (
    <MainLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            ADMINISTRAÇÃO DO SISTEMA
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Controle de Módulos</h1>
          <p className="text-xs text-slate-500">
            Configure dados fiscais, logomarca da empresa, credenciais WhatsApp Baileys, servidor SMTP de e-mail e gateways de pagamento.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> Configurações atualizadas e salvas com sucesso no sistema!
          </div>
        )}

        {/* Tab Navigation matching Control Panel design */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 text-xs font-bold shadow-2xs">
          {[
            { id: "empresa", label: "Dados da Empresa & Fiscais", icon: Building },
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone Fixo</label>
                  <input
                    type="text"
                    value={settings.company_phone || ""}
                    onChange={(e) => updateSetting("company_phone", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp da Loja</label>
                  <input
                    type="text"
                    value={settings.company_whatsapp || ""}
                    onChange={(e) => updateSetting("company_whatsapp", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    value={settings.company_email || ""}
                    onChange={(e) => updateSetting("company_email", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHATSAPP & BOT BAILEYS */}
          {activeTab === "whatsapp" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Bridge Baileys & Robô de Suporte
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  ● INSTÂNCIA ATIVA
                </span>
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
                    value={settings.whatsapp_phone || "+55 (11) 98877-6655"}
                    onChange={(e) => updateSetting("whatsapp_phone", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-emerald-700 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Token de Segurança para Webhook</label>
                <input
                  type="text"
                  value={settings.whatsapp_bot_token || "sec_token_grafica_9921"}
                  onChange={(e) => updateSetting("whatsapp_bot_token", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-purple-700 font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensagem Inicial do Robô de Autoatendimento</label>
                <textarea
                  rows={4}
                  value={settings.whatsapp_bot_greeting || ""}
                  onChange={(e) => updateSetting("whatsapp_bot_greeting", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: E-MAIL TRANSACIONAL & SMTP */}
          {activeTab === "smtp" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Server className="w-5 h-5 text-sky-600" /> Servidor SMTP de Produção para E-mails Transacionais
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  ● SMTP ATIVO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Servidor Host SMTP *</label>
                  <input
                    type="text"
                    value={settings.smtp_host || "smtp.printflow.com.br"}
                    onChange={(e) => updateSetting("smtp_host", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Porta SMTP *</label>
                  <input
                    type="text"
                    value={settings.smtp_port || "587"}
                    onChange={(e) => updateSetting("smtp_port", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Usuário de Autenticação</label>
                  <input
                    type="text"
                    value={settings.smtp_user || "vendas@printflow.com.br"}
                    onChange={(e) => updateSetting("smtp_user", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Senha SMTP</label>
                  <input
                    type="password"
                    value={settings.smtp_pass || "••••••••••••"}
                    onChange={(e) => updateSetting("smtp_pass", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome do Remetente Exibido</label>
                  <input
                    type="text"
                    value={settings.smtp_from_name || "PrintFlow Gráfica Criativa"}
                    onChange={(e) => updateSetting("smtp_from_name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Criptografia / Conexão</label>
                  <select
                    value={settings.smtp_encryption || "TLS"}
                    onChange={(e) => updateSetting("smtp_encryption", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold outline-hidden"
                  >
                    <option value="TLS">TLS (Porta 587 - Recomendado)</option>
                    <option value="SSL">SSL (Porta 465)</option>
                    <option value="NONE">Sem Criptografia (Porta 25)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GATEWAYS INFINITEPAY & SUPERFRETE */}
          {activeTab === "gateways" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" /> Gateway InfinitePay
                </h3>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">API Key / Token Live InfinitePay</label>
                  <input
                    type="text"
                    value={settings.infinitepay_api_key || ""}
                    onChange={(e) => updateSetting("infinitepay_api_key", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sky-600" /> Token SuperFrete
                </h3>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Token de Acesso API SuperFrete</label>
                  <input
                    type="text"
                    value={settings.superfrete_token || ""}
                    onChange={(e) => updateSetting("superfrete_token", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono outline-hidden"
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
