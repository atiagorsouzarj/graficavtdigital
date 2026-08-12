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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WhatsAppConfigData {
  instanceName: string;
  status: string; // 'connected', 'pairing', 'disconnected'
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

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function WhatsappPage() {
  const [config, setConfig] = useState<WhatsAppConfigData>({
    instanceName: "Baileys Main Instance (Baileys v6.7.0)",
    status: "connected",
    connectedPhone: "+55 (11) 98877-6655",
    botEnabled: true,
    botGreetingMsg: "Olá! Bem-vindo à Gráfica & Papelaria Personalizada. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",
    botSecurityToken: "sec_token_grafica_9921",
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // Templates
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  // Outbox
  const [outbox, setOutbox] = useState<any[]>([]);

  // Bot Simulator Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Olá! Bem-vindo à PrintFlow Gráfica & Papelaria. Escolha uma opção:\n1️⃣ - Solicitar Orçamento\n2️⃣ - Aprovar Arte Digital\n3️⃣ - Rastrear Pedido\n4️⃣ - Atendimento Humano",
      time: "10:00",
    },
  ]);
  const [simulatedInput, setSimulatedInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Manual Dispatch
  const [dispatchPhone, setDispatchPhone] = useState("(11) 98765-4321");
  const [dispatchName, setDispatchName] = useState("Lucas Mendes");
  const [dispatchMsg, setDispatchMsg] = useState("Olá Lucas! A arte digital do seu pedido *PED-2026-001* está pronta para validação em: https://printflow.com.br/aprovar-arte/demo");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchWhatsappData = async () => {
    try {
      const res = await fetch("/api/whatsapp");
      const data = await res.json();
      if (data.config) setConfig(data.config);
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

  const handleSimulateBotMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simulatedInput.trim()) return;

    const userText = simulatedInput;
    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => [...prev, { sender: "user", text: userText, time: timeNow }]);
    setSimulatedInput("");
    setIsBotTyping(true);

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bot_simulate", message: userText }),
      });
      const data = await res.json();

      setTimeout(() => {
        setIsBotTyping(false);
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.botReply, time: data.timestamp || timeNow },
        ]);
      }, 600);
    } catch {
      setIsBotTyping(false);
    }
  };

  const handleSendManual = async () => {
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_message",
        phone: dispatchPhone,
        clientName: dispatchName,
        message: dispatchMsg,
      }),
    });
    if (res.ok) {
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      fetchWhatsappData();
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

  // Live variable rendering for WhatsApp
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
              CONEXÃO BAILEYS SOCKET & BOT AUTOMÁTICO
            </span>
            <h1 className="text-2xl font-bold text-slate-800">
              WhatsApp Bridge & Robô de Atendimento
            </h1>
            <p className="text-xs text-slate-500">
              Pareamento via QR Code Baileys, bot automático de suporte e disparo de mensagens transacionais por etapa do Kanban.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Configurações do WhatsApp e Bot salvas com sucesso!
          </div>
        )}

        {/* SECTION 1: BAILEYS BRIDGE CONNECTION & SECURITY BOT PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Baileys Socket Connection Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
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
                <span className="text-slate-500">Token do Bot (Webhook):</span>
                <strong className="font-mono text-purple-700">{config.botSecurityToken}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nível de Bateria do Aparelho:</span>
                <strong className="text-slate-800">98% ⚡</strong>
              </div>
            </div>

            {/* Action Buttons */}
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

            {/* QR Code / Pairing Display */}
            {qrCodeUrl && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center space-y-3 animate-in zoom-in-95">
                <p className="text-xs font-bold text-sky-400">
                  Escaneie o QR Code no WhatsApp (Aparelhos Conectados):
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

          {/* Bot Greeting & Settings Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Robô de Autoatendimento (Bot)</h3>
                  <span className="text-[10px] text-slate-400 block">Resposta automática por menu de opções</span>
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

            <div>
              <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                TOKEN DE SEGURANÇA PARA INTEGRAÇÃO WEBHOOK
              </label>
              <input
                type="text"
                value={config.botSecurityToken}
                onChange={(e) => setConfig({ ...config, botSecurityToken: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-purple-800 outline-hidden"
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
        </div>

        {/* SECTION 2: INTERACTIVE BOT AUTO-RESPONDER CHAT SIMULATOR (WhatsApp Phone UI) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Simulador de Atendimento em Tempo Real (WhatsApp Chat)
            </h2>
            <span className="text-[10px] text-slate-400">
              Digite "1", "2", "3" ou "PV-0000101" para testar o autoatendimento.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Phone Mockup Screen (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-4 shadow-xl border-4 border-slate-800 flex flex-col h-[420px] relative overflow-hidden">
              {/* WhatsApp Phone Bar */}
              <div className="bg-emerald-800 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-800 font-black text-xs flex items-center justify-center">
                    PF
                  </div>
                  <div>
                    <strong className="block text-xs font-bold">PrintFlow • Bot Gráfica</strong>
                    <span className="text-[9px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                      online agora
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-200 font-mono">Baileys API</span>
              </div>

              {/* Chat Conversation Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl shadow-xs whitespace-pre-line leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-emerald-700 text-white rounded-tr-none"
                          : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[9px] text-slate-300 text-right mt-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] italic bg-slate-800 p-2 rounded-xl w-fit">
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>PrintFlow Bot está digitando...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={handleSimulateBotMessage} className="mt-3 flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={simulatedInput}
                  onChange={(e) => setSimulatedInput(e.target.value)}
                  placeholder="Simular mensagem do cliente (ex: 1, 2, 3, PV-0000101)..."
                  className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
              </form>
            </div>

            {/* Quick Test Shortcuts */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-extrabold text-slate-700 uppercase text-[10px] block">
                Atalhos Rápidos de Teste de Autoatendimento
              </span>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSimulatedInput("1");
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left font-semibold text-slate-800 cursor-pointer transition-colors block"
                >
                  1️⃣ Solicitar Novo Orçamento
                </button>

                <button
                  onClick={() => {
                    setSimulatedInput("2");
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left font-semibold text-slate-800 cursor-pointer transition-colors block"
                >
                  2️⃣ Aprovação de Arte Digital (Portal)
                </button>

                <button
                  onClick={() => {
                    setSimulatedInput("PV-0000101");
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left font-semibold text-slate-800 cursor-pointer transition-colors block"
                >
                  3️⃣ Consultar Status do Pedido PV-0000101
                </button>

                <button
                  onClick={() => {
                    setSimulatedInput("4");
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left font-semibold text-slate-800 cursor-pointer transition-colors block"
                >
                  4️⃣ Falar com Atendente Humano
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TEMPLATES TRANSACIONAIS POR ETAPA DO KANBAN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" /> Templates Transacionais por Etapa do Kanban
            </h2>
            <span className="text-[10px] text-slate-400">
              Disparados automaticamente no WhatsApp quando o pedido muda de fase.
            </span>
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
                onClick={handleSendManual}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" /> Disparar Teste via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: HISTÓRICO DE MENSAGENS ENVIADAS (OUTBOX LOG) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Inbox className="w-4 h-4 text-sky-600" /> Histórico de Disparos WhatsApp (Caixa de Saída)
            </h3>
            <span className="text-[10px] text-slate-400">{outbox.length} registros</span>
          </div>

          <div className="space-y-2">
            {outbox.map((e, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <strong className="text-slate-800 font-bold block text-xs">
                    {e.clientName} ({e.phone})
                  </strong>
                  <p className="text-slate-600 text-[11px] line-clamp-1 mt-0.5">{e.body}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{e.time}</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full self-start sm:self-auto ${
                    e.status === "LIDO"
                      ? "bg-sky-100 text-sky-800 border border-sky-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  ✓ {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Loader2Icon(props: any) {
  return <RefreshCw {...props} />;
}
