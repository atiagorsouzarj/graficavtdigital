"use client";

import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/MainLayout";
import {
  MessageSquare,
  QrCode,
  Shield,
  Bot,
  Send,
  CheckCircle2,
  RefreshCw,
  Power,
  Key,
  Smartphone,
  Sparkles,
  Phone,
  Copy,
  Check,
  Zap,
  Edit3,
  Inbox,
  User,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  PauseCircle,
  PlayCircle,
  UserCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WhatsAppConfigData {
  instanceName: string;
  status: string;
  connectedPhone: string;
  botEnabled: boolean;
  botGreetingMsg: string;
  botSecurityToken: string;
}

interface TemplateItem {
  id: string;
  channel: string;
  code: string;
  title: string;
  body: string;
}

export default function WhatsappPage() {
  const [activeTab, setActiveTab] = useState<"connection" | "live_chat" | "templates" | "bot_simulator">("live_chat");

  const [config, setConfig] = useState<WhatsAppConfigData>({
    instanceName: "Baileys Main Instance (Baileys v6.7.0)",
    status: "connected",
    connectedPhone: "+55 (21) 97886-9414",
    botEnabled: true,
    botGreetingMsg: "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",
    botSecurityToken: "sec_token_grafica_9921",
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // Live Chat
  const [contacts, setContacts] = useState<any[]>([]);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [selectedContactPhone, setSelectedContactPhone] = useState<string>("(11) 98765-4321");
  const [chatInputText, setChatInputText] = useState("");

  // Templates
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  // Outbox
  const [outbox, setOutbox] = useState<any[]>([]);

  // Bot Simulator Chat
  const [simulatedInput, setSimulatedInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [sendSuccess, setSendSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchWhatsappData = async () => {
    try {
      const res = await fetch("/api/whatsapp");
      const data = await res.json();
      if (data.config) setConfig(data.config);
      if (data.liveChat) {
        setContacts(data.liveChat.contacts || []);
        setLiveMessages(data.liveChat.messages || []);
      }
      if (Array.isArray(data.templates)) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          const first = data.templates[0];
          setSelectedTemplate(first);
          setTemplateTitle(first.title);
          setTemplateBody(first.body);
        }
      }
      if (Array.isArray(data.outbox)) setOutbox(data.outbox);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWhatsappData();
  }, []);

  const handleGenerateQR = async () => {
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_qr" }),
    });
    const data = await res.json();
    setQrCodeUrl(data.qrCodeUrl);
    setPairingCode(data.pairingCode);
    setConfig({ ...config, status: "pairing" });
  };

  const handleToggleConnection = async () => {
    const nextAction = config.status === "connected" ? "disconnect" : "connect";
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: nextAction }),
    });
    if (res.ok) {
      const data = await res.json();
      setConfig({ ...config, status: data.status });
      setQrCodeUrl(null);
    }
  };

  // Toggle Human Intervention (Pause / Resume Bot for selected contact)
  const handleToggleBotPause = async (phone: string, currentPaused: boolean) => {
    const action = currentPaused ? "resume_bot" : "pause_bot";
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, phone }),
    });
    if (res.ok) {
      fetchWhatsappData();
    }
  };

  // Send Human Agent Direct Message
  const handleSendAgentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedContactPhone) return;

    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_message",
        phone: selectedContactPhone,
        message: chatInputText,
        sender: "agent",
      }),
    });

    if (res.ok) {
      setChatInputText("");
      fetchWhatsappData();
    }
  };

  const handleSendManualTest = async () => {
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_message",
        phone: "(11) 98765-4321",
        clientName: "Cliente Teste",
        message: templateBody,
        sender: "bot",
      }),
    });
    if (res.ok) {
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      fetchWhatsappData();
    }
  };

  const handleSimulateBotMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simulatedInput.trim()) return;

    const userText = simulatedInput;
    setSimulatedInput("");
    setIsBotTyping(true);

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bot_simulate", message: userText, phone: "(11) 98765-4321" }),
      });
      await res.json();

      setTimeout(() => {
        setIsBotTyping(false);
        fetchWhatsappData();
      }, 500);
    } catch {
      setIsBotTyping(false);
    }
  };

  const handleSaveConfig = async () => {
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_config",
        botGreetingMsg: config.botGreetingMsg,
        botSecurityToken: config.botSecurityToken,
        botEnabled: config.botEnabled,
      }),
    });
    if (res.ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSelectTemplate = (t: TemplateItem) => {
    setSelectedTemplate(t);
    setTemplateTitle(t.title);
    setTemplateBody(t.body);
  };

  const insertVariable = (tag: string) => {
    setTemplateBody((prev) => prev + " " + tag);
  };

  const currentContact = contacts.find((c) => c.phone === selectedContactPhone) || contacts[0];
  const filteredMessages = liveMessages.filter((m) => m.contactPhone === selectedContactPhone);

  const renderedWhatsappTemplate = templateBody
    .replace(/\{\{nome_cliente\}\}/g, "Lucas Mendes")
    .replace(/\{\{codigo_pedido\}\}/g, "PED-2026-001")
    .replace(/\{\{valor_total\}\}/g, "R$ 215,00")
    .replace(/\{\{link_aprovacao\}\}/g, "https://printflow.com.br/aprovar-arte/demo")
    .replace(/\{\{empresa_nome\}\}/g, "PrintFlow Gráfica Criativa");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              BAILEYS WEBSOCKETS BRIDGE & LIVE CHAT ATENDIMENTO
            </span>
            <h1 className="text-2xl font-bold text-slate-800">
              WhatsApp Módulo Sênior & Atendimento ao Vivo
            </h1>
            <p className="text-xs text-slate-500">
              Gerencie chats em tempo real, intervenção de atendente humano, robô de suporte e automação do Kanban.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Configurações do WhatsApp e Bot salvas com sucesso!
          </div>
        )}

        {sendSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Mensagem de teste do template disparada no WhatsApp!
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 text-xs font-bold shadow-2xs">
          {[
            { id: "live_chat", label: "💬 Live Chat & Atendimento Humano", badge: "Ao vivo" },
            { id: "connection", label: "📱 Conexão Baileys & QR Code", badge: "Status" },
            { id: "bot_simulator", label: "🤖 Bot de Autoatendimento", badge: "Simulador" },
            { id: "templates", label: "✉️ Templates por Etapa do Kanban", badge: "Automação" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === t.id
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: LIVE CHAT & ATENDIMENTO HUMANO */}
        {activeTab === "live_chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs animate-in fade-in duration-150">
            {/* Contacts Sidebar (1 col) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <span className="font-extrabold text-slate-800 uppercase text-[10px] block border-b border-slate-100 pb-2">
                Conversas Ativas ({contacts.length})
              </span>

              <div className="space-y-2">
                {contacts.map((c) => {
                  const isSelected = c.phone === selectedContactPhone;
                  return (
                    <button
                      key={c.phone}
                      onClick={() => setSelectedContactPhone(c.phone)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-sky-50 border-sky-500 font-bold text-sky-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <strong className="text-slate-900 block font-bold text-xs">{c.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{c.lastTime}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{c.lastMessage}</p>

                      <div className="mt-2 flex items-center justify-between">
                        {c.botPaused ? (
                          <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-purple-600" /> Atendente Humano
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Bot className="w-3 h-3 text-emerald-600" /> Bot Ativo
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Conversation & Human Takeover Panel (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-2xl flex flex-col justify-between h-[520px]">
              {/* Chat Header */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                    {currentContact?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <strong className="block font-bold text-sm text-white">{currentContact?.name || "Cliente WhatsApp"}</strong>
                    <span className="font-mono text-[10px] text-slate-400">{currentContact?.phone}</span>
                  </div>
                </div>

                {/* Human Takeover Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleBotPause(selectedContactPhone, currentContact?.botPaused)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    currentContact?.botPaused
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  }`}
                >
                  {currentContact?.botPaused ? (
                    <>
                      <PlayCircle className="w-4 h-4" /> Reativar Bot Automático
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4" /> Pausar Bot & Assumir Conversa
                    </>
                  )}
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1 text-xs">
                {filteredMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === "customer" ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl shadow-xs whitespace-pre-line leading-relaxed ${
                        m.sender === "customer"
                          ? "bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none"
                          : m.sender === "agent"
                          ? "bg-sky-600 text-white rounded-tr-none"
                          : "bg-purple-900/80 text-purple-100 border border-purple-500/40 rounded-tr-none"
                      }`}
                    >
                      <div className="text-[9px] opacity-75 font-bold mb-1">
                        {m.sender === "customer" ? "Cliente" : m.sender === "agent" ? "Atendente Tiago" : "PrintFlow Bot"}
                      </div>
                      {m.message}
                      <div className="text-[9px] opacity-60 text-right mt-1 font-mono">
                        {m.timestamp} • ✓ {m.status || "entregue"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Direct Input Form */}
              <form onSubmit={handleSendAgentMessage} className="pt-2 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Enviar mensagem direta como atendente humano..."
                  className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2.5 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: BAILEYS BRIDGE CONNECTION & SECURITY */}
        {activeTab === "connection" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs animate-in fade-in duration-150">
            {/* Baileys Socket Connection Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{config.instanceName}</h3>
                    <span className="text-[10px] text-slate-400 font-mono block">Baileys WebSocket Socket v6.7.0</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                    config.status === "connected"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : config.status === "pairing"
                      ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      config.status === "connected"
                        ? "bg-emerald-500 animate-ping"
                        : "bg-red-500"
                    }`}
                  />
                  {config.status === "connected"
                    ? "CONECTADO"
                    : config.status === "pairing"
                    ? "AGUARDANDO QR"
                    : "DESCONECTADO"}
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Número Conectado:</span>
                  <strong className="font-mono text-emerald-700">{config.connectedPhone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Token de Segurança Webhook:</span>
                  <strong className="font-mono text-purple-700">{config.botSecurityToken}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diretório de Sessão Isolado:</span>
                  <strong className="font-mono text-slate-800">.wh-auth/ (Rotativa Segura)</strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateQR}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar Novo QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleConnection}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    config.status === "connected"
                      ? "bg-red-100 hover:bg-red-200 text-red-800"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{config.status === "connected" ? "Desconectar Baileys" : "Reconectar Baileys"}</span>
                </button>
              </div>

              {qrCodeUrl && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center space-y-3 animate-in zoom-in-95">
                  <p className="text-xs font-bold text-sky-400">
                    Escaneie o QR Code no seu WhatsApp:
                  </p>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Baileys Bridge"
                    className="w-48 h-48 mx-auto rounded-xl border-4 border-white shadow-md"
                  />
                  {pairingCode && (
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 block text-[10px]">Código de Pareamento Direto:</span>
                      <strong className="text-emerald-400 font-mono text-base tracking-widest">{pairingCode}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Anti-ban Rules & Protection Info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="w-5 h-5 text-purple-600" /> Proteção Anti-Ban & Regras do Servidor
              </h3>

              <div className="space-y-3 text-slate-600">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                  <strong className="text-purple-900 block font-bold">1. Rate Limiting Jitter (Delays Aleatórios):</strong>
                  <p>O sistema aplica pausas aleatórias entre 1.5s a 3.5s antes de cada disparo para simular o comportamento humano real e evitar bloqueios.</p>
                </div>

                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 space-y-1">
                  <strong className="text-sky-900 block font-bold">2. Simulação de Presença Humana (`composing`):</strong>
                  <p>Antes de enviar a mensagem, o Baileys emite o evento de digitação ("digitando...") para o destinatário.</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <strong className="text-emerald-900 block font-bold">3. Sessão Isolada MultiFile:</strong>
                  <p>Os tokens de sessão são salvos na pasta restrita `.wh-auth/` protegidos por hash rotativo de segurança.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOT SIMULATOR & SAUDAÇÃO */}
        {activeTab === "bot_simulator" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Configuração & Robô de Autoatendimento</h3>
                  <span className="text-[10px] text-slate-400 block">Atendimento por menu e transferência para atendente humano</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={config.botEnabled}
                  onChange={(e) => setConfig({ ...config, botEnabled: e.target.checked })}
                  className="rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span>Bot Ativo</span>
              </label>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                MENSAGEM DE SAUDAÇÃO & MENU INICIAL
              </label>
              <textarea
                rows={5}
                value={config.botGreetingMsg}
                onChange={(e) => setConfig({ ...config, botGreetingMsg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Salvar Configurações do Bot
            </button>
          </div>
        )}

        {/* TAB 4: TEMPLATES POR ETAPA DO KANBAN */}
        {activeTab === "templates" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600" /> Templates Transacionais por Etapa do Kanban
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* List of Stage Templates (1 col) */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">
                  Etapas do Sistema
                </span>
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer block ${
                      selectedTemplate?.id === t.id
                        ? "bg-sky-50 border-sky-500 font-bold text-sky-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-bold text-xs">{t.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Gatilho: {t.code}</span>
                  </button>
                ))}
              </div>

              {/* Template Editor (1 col) */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                    TÍTULO DO TEMPLATE
                  </label>
                  <input
                    type="text"
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                    MENSAGEM WHATSAPP (Suporta *negrito* e _itálico_)
                  </label>
                  <textarea
                    rows={8}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-slate-500 uppercase text-[10px] block">
                    VARIÁVEIS DISPONÍVEIS (Clique para inserir)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "{{nome_cliente}}",
                      "{{codigo_pedido}}",
                      "{{valor_total}}",
                      "{{link_aprovacao}}",
                      "{{empresa_nome}}",
                    ].map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => insertVariable(v)}
                        className="px-2 py-1 bg-slate-100 hover:bg-sky-100 text-slate-700 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors border border-slate-200"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live WhatsApp Bubble Preview (1 col) */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 text-xs shadow-md">
                <span className="font-bold text-sky-400 block border-b border-slate-800 pb-2">
                  Preview no WhatsApp do Cliente
                </span>

                <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 text-emerald-100 font-mono text-xs whitespace-pre-line leading-relaxed shadow-xs">
                  {renderedWhatsappTemplate}
                </div>

                <button
                  type="button"
                  onClick={handleSendManualTest}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" /> Disparar Teste via WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
