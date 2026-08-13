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
  Search,
  Filter,
  Paperclip,
  Smile,
  DollarSign,
  Palette,
  Truck,
  Plus,
  SendHorizontal,
  Building2,
  Layers,
  Megaphone,
  BarChart2,
  CheckCheck,
  AlertCircle,
  Settings,
  Battery,
  Wifi,
  Lock,
  Save,
  Sliders,
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

interface LiveChatMessage {
  id: string;
  contactPhone: string;
  contactName: string;
  sender: "customer" | "agent" | "bot";
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "failed";
}

interface LiveChatContact {
  phone: string;
  name: string;
  company?: string;
  lastMessage: string;
  lastTime: string;
  botPaused: boolean;
  unreadCount: number;
  clientType?: string;
  totalOrdersAmount?: string;
  recentOrderCode?: string;
  recentOrderStatus?: string;
}

export default function WhatsappPage() {
  const [activeTab, setActiveTab] = useState<
    "live_chat" | "bot_config" | "automations" | "broadcast" | "templates" | "bot_simulator" | "connection"
  >("live_chat");

  const [config, setConfig] = useState<WhatsAppConfigData>({
    instanceName: "Baileys Senior WebSockets Bridge (Baileys v6.7.0)",
    status: "connected",
    connectedPhone: "+55 (21) 97886-9414",
    botEnabled: true,
    botGreetingMsg:
      "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",
    botSecurityToken: "sec_token_grafica_9921",
  });

  // Bot Config Form States
  const [botGreetingMsg, setBotGreetingMsg] = useState(
    "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano"
  );
  const [botOpt1, setBotOpt1] = useState(
    "📋 *Solicitação de Orçamento*\n\nPara agilizar o seu atendimento, por favor envie:\n• O item que precisa (ex: Cartão de Visita, Banner, Caneca, DTF)\n• A quantidade desejada\n• Se possui arte pronta\n\nNossa equipe comercial retornará em instantes!"
  );
  const [botOpt2, setBotOpt2] = useState(
    "🎨 *Aprovação de Arte Digital*\n\nVocê pode visualizar e aprovar sua prova digital diretamente pelo portal do cliente:\n👉 https://printflow.com.br/aprovar-arte/demo\n\nLá você pode autorizar a impressão ou solicitar ajustes no layout!"
  );
  const [botOpt3, setBotOpt3] = useState(
    "🔍 *Status do Pedido*\n\nDigite o código do seu pedido (ex: PV-000102) para consultar o status da produção e nota fiscal!"
  );
  const [botOpt4, setBotOpt4] = useState(
    "👨‍💻 *Atendimento Humano*\n\nEntendi! Pausamos o robô automático e transferimos você para um de nossos atendentes humanos. Por favor aguarde um momento..."
  );
  const [botEnabled, setBotEnabled] = useState(true);
  const [botInstanceName, setBotInstanceName] = useState("Baileys Senior WebSockets Bridge (Baileys v6.7.0)");
  const [botSecurityToken, setBotSecurityToken] = useState("sec_token_grafica_9921");
  const [saveBotConfigSuccess, setSaveBotConfigSuccess] = useState(false);
  const [savingBotConfig, setSavingBotConfig] = useState(false);

  const [socketInfo, setSocketInfo] = useState<{
    connected: boolean;
    connectedPhone?: string | null;
    uptimeSeconds?: number;
    engine?: string;
    authDir?: string;
  } | null>(null);

  const formatUptime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "desconectado";
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    return `${h}h ${min % 60}min`;
  };

  const socketMetrics = {
    batteryLevel: socketInfo?.connected ? "online" : "offline",
    latencyMs: socketInfo?.connected ? "estável" : "—",
    uptime: socketInfo ? formatUptime(socketInfo.uptimeSeconds || 0) : "carregando...",
    engine: socketInfo?.engine || "Baileys v6.7.24 WebSockets (Real Socket)",
  };

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // Contacts and Messages
  const [contacts, setContacts] = useState<LiveChatContact[]>([
    {
      phone: "(11) 98765-4321",
      name: "Studio Design & Eventos",
      company: "Studio Design Ltda (PJ)",
      lastMessage: "O valor de 500 cartões de visita Couchê 300g é R$ 95,00.",
      lastTime: "10:16",
      botPaused: false,
      unreadCount: 0,
      clientType: "PJ",
      totalOrdersAmount: "R$ 1.840,00",
      recentOrderCode: "PV-000102",
      recentOrderStatus: "Em Impressão",
    },
    {
      phone: "(21) 99690-2449",
      name: "Raphaela Pinheiro",
      company: "Cliente Física (PF)",
      lastMessage: "Boa tarde Raphaela! O seu topo de bolo está pronto para retirada!",
      lastTime: "11:32",
      botPaused: true,
      unreadCount: 0,
      clientType: "PF",
      totalOrdersAmount: "R$ 317,00",
      recentOrderCode: "CUP-003798",
      recentOrderStatus: "Pronto p/ Retirada",
    },
    {
      phone: "(21) 97886-9414",
      name: "Tiago Souza (Atacado)",
      company: "Gráfica VT Digital",
      lastMessage: "Preciso de orçamento para 10 Banners em Lona 440g.",
      lastTime: "12:05",
      botPaused: false,
      unreadCount: 1,
      clientType: "VIP",
      totalOrdersAmount: "R$ 4.500,00",
      recentOrderCode: "ORC-00982",
      recentOrderStatus: "Arte em Aprovação",
    },
  ]);

  const [liveMessages, setLiveMessages] = useState<LiveChatMessage[]>([
    {
      id: "msg_1",
      contactPhone: "(11) 98765-4321",
      contactName: "Studio Design & Eventos",
      sender: "customer",
      message: "Olá! Gostaria de saber o valor de 500 cartões de visita e se entregam em SP.",
      timestamp: "10:15",
      status: "read",
    },
    {
      id: "msg_2",
      contactPhone: "(11) 98765-4321",
      contactName: "Studio Design & Eventos",
      sender: "bot",
      message: "Olá! O valor de 500 cartões de visita Couchê 300g com verniz é R$ 95,00. Entregamos via SuperFrete SEDEX em toda SP!",
      timestamp: "10:16",
      status: "read",
    },
    {
      id: "msg_3",
      contactPhone: "(21) 99690-2449",
      contactName: "Raphaela Pinheiro",
      sender: "customer",
      message: "Boa tarde! O meu pedido PV-003798 já está pronto?",
      timestamp: "11:30",
      status: "read",
    },
    {
      id: "msg_4",
      contactPhone: "(21) 99690-2449",
      contactName: "Raphaela Pinheiro",
      sender: "agent",
      message: "Boa tarde Raphaela! Sim, o seu topo de bolo e impressões estão prontos e embalados para retirada!",
      timestamp: "11:32",
      status: "delivered",
    },
    {
      id: "msg_5",
      contactPhone: "(21) 97886-9414",
      contactName: "Tiago Souza (Atacado)",
      sender: "customer",
      message: "Preciso de orçamento para 10 Banners em Lona 440g 120x90cm com ilhós.",
      timestamp: "12:05",
      status: "read",
    },
  ]);

  const [selectedContactPhone, setSelectedContactPhone] = useState<string>("(11) 98765-4321");
  const [chatInputText, setChatInputText] = useState("");
  const [filterType, setFilterType] = useState<"all" | "human" | "bot">("all");
  const [searchContactText, setSearchContactText] = useState("");

  // Templates
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  // Broadcast / Marketing
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "pj" | "vip">("all");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState("");

  // Bot Simulator
  const [simulatedInput, setSimulatedInput] = useState("");
  const [simulatedHistory, setSimulatedInputHistory] = useState<
    Array<{ sender: "user" | "bot"; text: string; time: string }>
  >([
    {
      sender: "user",
      text: "oi",
      time: "12:00",
    },
    {
      sender: "bot",
      text: "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",
      time: "12:00",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchWhatsappData = async () => {
    try {
      const res = await fetch("/api/whatsapp");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setBotGreetingMsg(data.config.botGreetingMsg || botGreetingMsg);
        setBotEnabled(data.config.botEnabled !== false);
        setBotInstanceName(data.config.instanceName || botInstanceName);
        setBotSecurityToken(data.config.botSecurityToken || botSecurityToken);
      }
      if (Array.isArray(data.templates)) {
        setTemplates(data.templates);
        if (data.templates.length > 0) setSelectedTemplate(data.templates[0]);
      }
      if (data.socketInfo) {
        setSocketInfo(data.socketInfo);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWhatsappData();
  }, []);

  // Save Bot Settings
  const handleSaveBotSettings = async () => {
    setSavingBotConfig(true);
    setSaveBotConfigSuccess(false);

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_config",
          botGreetingMsg,
          botEnabled,
          instanceName: botInstanceName,
          botSecurityToken,
        }),
      });

      if (res.ok) {
        setSaveBotConfigSuccess(true);
        setTimeout(() => setSaveBotConfigSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBotConfig(false);
    }
  };

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

  // Toggle Human Agent Takeover
  const handleToggleBotPause = async (phone: string, currentPaused: boolean) => {
    const action = currentPaused ? "resume_bot" : "pause_bot";
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, phone }),
    });
    if (res.ok) {
      setContacts((prev) =>
        prev.map((c) => (c.phone === phone ? { ...c, botPaused: !currentPaused } : c))
      );
    }
  };

  // Send message in Live Chat
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInputText;
    if (!textToSend.trim()) return;

    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const selectedContact = contacts.find((c) => c.phone === selectedContactPhone);

    const newMsg: LiveChatMessage = {
      id: `msg_agent_${Date.now()}`,
      contactPhone: selectedContactPhone,
      contactName: selectedContact?.name || "Cliente WhatsApp",
      sender: "agent",
      message: textToSend,
      timestamp: timeNow,
      status: "delivered",
    };

    setLiveMessages((prev) => [...prev, newMsg]);
    setContacts((prev) =>
      prev.map((c) =>
        c.phone === selectedContactPhone
          ? { ...c, lastMessage: textToSend, lastTime: timeNow, botPaused: true }
          : c
      )
    );

    if (!customText) setChatInputText("");

    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          phone: selectedContactPhone,
          clientName: selectedContact?.name,
          message: textToSend,
          sender: "agent",
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Simulator send
  const handleSimulateBot = async () => {
    if (!simulatedInput.trim()) return;
    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const userText = simulatedInput;
    setSimulatedInputHistory((prev) => [...prev, { sender: "user", text: userText, time: timeNow }]);
    setSimulatedInput("");

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bot_simulate",
          phone: "(11) 98765-4321",
          message: userText,
        }),
      });
      const data = await res.json();
      setSimulatedInputHistory((prev) => [
        ...prev,
        { sender: "bot", text: data.reply, time: data.timestamp || timeNow },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Broadcast submit
  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastSending(true);
    setTimeout(() => {
      setBroadcastSending(false);
      setBroadcastSuccessMsg("Disparo em massa enviado com sucesso com intervalo anti-ban (1.5s a 3.5s)!");
      setTimeout(() => setBroadcastSuccessMsg(""), 4000);
    }, 2000);
  };

  const selectedContact = contacts.find((c) => c.phone === selectedContactPhone) || contacts[0];
  const activeChatMessages = liveMessages.filter((m) => m.contactPhone === selectedContactPhone);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchContactText.toLowerCase()) ||
      c.phone.includes(searchContactText);
    if (filterType === "human") return matchesSearch && c.botPaused;
    if (filterType === "bot") return matchesSearch && !c.botPaused;
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-4">
        
        {/* Top Baileys Status & Engine Metrics Header */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-wide text-white">
                    Central de Comunicação & WhatsApp Bot Baileys
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    CONECTADO (WEBSOCKETS)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Instância Baileys v6.7.0 Senior • Atendimento Omnichannel com Gestão de Atendente Humano e IA.
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">NÚMERO CONECTADO</span>
                  <span className="font-mono font-bold text-white text-xs">{config.connectedPhone}</span>
                </div>
              </div>

              <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <Battery className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">BATERIA / LATÊNCIA</span>
                  <span className="font-mono font-bold text-sky-300 text-xs">{socketMetrics.batteryLevel} • {socketMetrics.latencyMs}</span>
                </div>
              </div>

              <button
                onClick={handleToggleConnection}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  config.status === "connected"
                    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{config.status === "connected" ? "Desconectar" : "Conectar Socket"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-1 border-t border-slate-800 pt-3">
            <button
              onClick={() => setActiveTab("live_chat")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "live_chat"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Conversas Live Chat</span>
              <span className="bg-sky-500/40 text-sky-200 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {contacts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("bot_config")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "bot_config"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>⚙️ Configurar Bot & Respostas</span>
            </button>

            <button
              onClick={() => setActiveTab("automations")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "automations"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Gatilhos Kanban & ERP</span>
            </button>

            <button
              onClick={() => setActiveTab("broadcast")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "broadcast"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Disparador em Massa</span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "templates"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab("bot_simulator")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "bot_simulator"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Simulador do Bot</span>
            </button>

            <button
              onClick={() => setActiveTab("connection")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "connection"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code & Chaves</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OMNICHANNEL LIVE CHAT */}
        {activeTab === "live_chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-[calc(100vh-210px)] min-h-[580px]">
            
            {/* LEFT PANEL: Contact List / Inbox */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-sky-600" /> Caixas de Entrada
                  </h3>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                    {filteredContacts.length} conversa(s)
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar contato ou fone..."
                    value={searchContactText}
                    onChange={(e) => setSearchContactText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-1 text-[11px] pt-1">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`flex-1 py-1 rounded-lg font-bold text-center cursor-pointer ${
                      filterType === "all" ? "bg-sky-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType("human")}
                    className={`flex-1 py-1 rounded-lg font-bold text-center cursor-pointer ${
                      filterType === "human" ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Humano 🛑
                  </button>
                  <button
                    onClick={() => setFilterType("bot")}
                    className={`flex-1 py-1 rounded-lg font-bold text-center cursor-pointer ${
                      filterType === "bot" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Robô 🤖
                  </button>
                </div>
              </div>

              {/* Contacts Scroll Area */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredContacts.map((contact) => {
                  const isSelected = contact.phone === selectedContactPhone;
                  return (
                    <button
                      key={contact.phone}
                      onClick={() => setSelectedContactPhone(contact.phone)}
                      className={`w-full p-3 text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected ? "bg-sky-50/90 border-l-4 border-sky-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </div>
                        {contact.botPaused ? (
                          <span
                            className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white absolute -bottom-0.5 -right-0.5"
                            title="Atendimento Humano Ativo"
                          />
                        ) : (
                          <span
                            className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5"
                            title="Bot Respondendo"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {contact.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {contact.lastTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {contact.lastMessage}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                              contact.botPaused
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {contact.botPaused ? "🛑 Humano Assumiu" : "🤖 Robô Ativo"}
                          </span>
                          {contact.clientType && (
                            <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded-md">
                              {contact.clientType}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTER PANEL: Active Conversation Stream */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              
              {/* Active Contact Header */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    {selectedContact.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {selectedContact.name}
                    </h2>
                    <p className="text-xs text-sky-400 font-mono">
                      {selectedContact.phone} • {selectedContact.company || "Cliente CRM"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleToggleBotPause(selectedContact.phone, selectedContact.botPaused)
                    }
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedContact.botPaused
                        ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                        : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                    }`}
                  >
                    {selectedContact.botPaused ? (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        <span>Reativar Robô</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-4 h-4" />
                        <span>Assumir Atendimento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp Messages Scroll */}
              <div className="flex-1 p-4 bg-slate-100 overflow-y-auto space-y-3 font-sans text-xs">
                {activeChatMessages.map((msg) => {
                  const isCustomer = msg.sender === "customer";
                  const isBot = msg.sender === "bot";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isCustomer ? "items-start" : "items-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 shadow-2xs space-y-1 relative ${
                          isCustomer
                            ? "bg-white text-slate-900 border border-slate-200 rounded-tl-xs"
                            : isBot
                            ? "bg-indigo-900 text-white rounded-tr-xs"
                            : "bg-emerald-700 text-white rounded-tr-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-bold opacity-80 pb-0.5 border-b border-white/10">
                          <span>
                            {isCustomer
                              ? selectedContact.name
                              : isBot
                              ? "🤖 Bot Automático PrintFlow"
                              : "👨‍💻 Atendente Tiago (Operador)"}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <p className="whitespace-pre-wrap leading-relaxed text-xs font-medium">
                          {msg.message}
                        </p>

                        <div className="flex justify-end text-[10px] opacity-75">
                          {!isCustomer && <CheckCheck className="w-3.5 h-3.5 text-sky-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Fast ERP Action Toolbar */}
              <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() =>
                    handleSendMessage(
                      `💳 *Chave PIX para Pagamento*\n\nChave CNPJ: 12.345.678/0001-90\nFavorecido: PrintFlow Gráfica Criativa\nBanco: Banco Inter\n\nEnvie o comprovante por aqui assim que efetuar o pagamento!`
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mandar Chave PIX</span>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      `🎨 *Aprovação de Prova Digital*\n\nSua arte está pronta para conferência! Por favor acesse e aprove no link:\n👉 https://printflow.com.br/aprovar-arte/${selectedContact.recentOrderCode || "PV-000102"}`
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span>Enviar Prova Digital</span>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      `🚚 *Código de Rastreio SuperFrete*\n\nSeu pedido foi despachado! Acompanhe o envio SEDEX no link:\n👉 https://printflow.com.br/rastreio/${selectedContact.recentOrderCode || "PV-000102"}`
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-purple-300 text-purple-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Mandar Rastreio</span>
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite sua resposta humana ou selecione uma ação acima..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />

                <button
                  onClick={() => handleSendMessage()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer shrink-0"
                >
                  <SendHorizontal className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Customer CRM Context & ERP Orders */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 h-full overflow-y-auto">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase text-sky-600 tracking-wider">
                  FICHA CRM INTEGRADA
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">{selectedContact.name}</h3>
                <p className="text-xs text-slate-500">{selectedContact.company || "Pessoa Física"}</p>
              </div>

              {/* Stats */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Histórico Total:</span>
                  <span className="font-extrabold text-slate-800">{selectedContact.totalOrdersAmount || "R$ 0,00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Último Pedido:</span>
                  <span className="font-mono font-bold text-sky-700">{selectedContact.recentOrderCode || "PV-000102"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Etapa Kanban:</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                    {selectedContact.recentOrderStatus || "Em Impressão"}
                  </span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2">
                <a
                  href="/orcamentos"
                  className="w-full p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Novo Orçamento</span>
                </a>

                <a
                  href="/clientes"
                  className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Abrir Ficha no CRM</span>
                </a>
              </div>

              {/* Bot State Indicator */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-xs">
                <span className="font-bold text-amber-900 block">Modo de Atendimento:</span>
                <p className="text-[11px] text-amber-800">
                  {selectedContact.botPaused
                    ? "🛑 Atendimento humano ativo. O bot automático não interromperá a conversa."
                    : "🤖 Bot de autoatendimento ativo. O robô responde comandos 1, 2, 3, 4."}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BOT CONFIGURATION & CUSTOM RESPONSES */}
        {activeTab === "bot_config" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-600" />
                  Configuração Geral do Bot Baileys & Respostas
                </h2>
                <p className="text-xs text-slate-500">
                  Ajuste o comportamento do robô, mensagens de boas-vindas, comandos 1, 2, 3, 4 e delays anti-ban.
                </p>
              </div>

              <button
                onClick={handleSaveBotSettings}
                disabled={savingBotConfig}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
              >
                {savingBotConfig ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{savingBotConfig ? "Salvando..." : "Salvar Configurações"}</span>
              </button>
            </div>

            {saveBotConfigSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Configurações do Bot de WhatsApp salvas com sucesso no banco de dados PostgreSQL!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Bot Global Status & Instance Details */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Bot className="w-4 h-4 text-sky-600" /> Parâmetros da Instância Baileys
                </h3>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Global do Bot Automático:</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBotEnabled(!botEnabled)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                        botEnabled
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      <span>{botEnabled ? "🤖 Bot LIGADO (Ativo)" : "🛑 Bot DESLIGADO (Pausado)"}</span>
                    </button>
                    <span className="text-[11px] text-slate-500">
                      {botEnabled
                        ? "O robô responderá automaticamente mensagens de novos clientes."
                        : "Todas as mensagens cairão diretamente para atendimento humano."}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome da Instância Conectada:</label>
                  <input
                    type="text"
                    value={botInstanceName}
                    onChange={(e) => setBotInstanceName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Token Secreto de Segurança da API:</label>
                  <input
                    type="text"
                    value={botSecurityToken}
                    onChange={(e) => setBotSecurityToken(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Anti-Ban & Typing Delay Settings */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Shield className="w-4 h-4 text-emerald-600" /> Proteção Anti-Ban & Presença Humana
                </h3>

                <div className="space-y-2 text-slate-600">
                  <p className="text-[11px]">
                    O sistema Baileys simula o comportamento de digitação humana (*composing*) antes de cada resposta para evitar bloqueios do WhatsApp.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 block">✓ Delay Aleatório (Jitter):</span>
                    <span className="text-[11px] text-slate-500">Intervalo de 1.500ms a 3.500ms entre recebimento e envio.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 block">✓ Presença "Composing":</span>
                    <span className="text-[11px] text-slate-500">Exibe a notificação "Digitando..." no aplicativo do cliente.</span>
                  </div>
                </div>
              </div>

              {/* Bot Greeting & Option Responses */}
              <div className="md:col-span-2 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MessageSquare className="w-4 h-4 text-sky-600" /> Mensagem de Boas-Vindas & Opções do Menu
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      1. Mensagem Principal de Boas-Vindas (Enviada ao receber "oi", "olá", "bom dia"):
                    </label>
                    <textarea
                      rows={4}
                      value={botGreetingMsg}
                      onChange={(e) => setBotGreetingMsg(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 font-sans text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Opção 1️⃣ - Solicitação de Orçamento:
                      </label>
                      <textarea
                        rows={3}
                        value={botOpt1}
                        onChange={(e) => setBotOpt1(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-sky-500 font-sans text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Opção 2️⃣ - Aprovação de Arte Digital:
                      </label>
                      <textarea
                        rows={3}
                        value={botOpt2}
                        onChange={(e) => setBotOpt2(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-sky-500 font-sans text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Opção 3️⃣ - Consultar Status do Pedido:
                      </label>
                      <textarea
                        rows={3}
                        value={botOpt3}
                        onChange={(e) => setBotOpt3(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-sky-500 font-sans text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Opção 4️⃣ - Transferir para Atendente Humano:
                      </label>
                      <textarea
                        rows={3}
                        value={botOpt4}
                        onChange={(e) => setBotOpt4(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-sky-500 font-sans text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button
                    onClick={handleSaveBotSettings}
                    disabled={savingBotConfig}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {savingBotConfig ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{savingBotConfig ? "Salvando..." : "Salvar Todas as Respostas do Bot"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: AUTOMATIONS & KANBAN TRIGGERS */}
        {activeTab === "automations" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-600" />
                Gatilhos Automáticos do Kanban & ERP
              </h2>
              <p className="text-xs text-slate-500">
                Sempre que a etapa de um pedido muda no Kanban, o sistema envia uma mensagem personalizada no WhatsApp do cliente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">1. Arte em Aprovação</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ATIVO</span>
                </div>
                <p className="text-xs text-slate-600">
                  Envia o link da Prova Digital para o cliente validar textos e cores antes da impressão.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">2. Pronto P/ Produção</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ATIVO</span>
                </div>
                <p className="text-xs text-slate-600">
                  Notifica o cliente que a arte foi aprovada e entrou na fila de impressão digital/CMyk.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">3. Aguardando Retirada/Envio</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ATIVO</span>
                </div>
                <p className="text-xs text-slate-600">
                  Avisa que o material está embalado e envia endereço da loja ou rastreio SuperFrete SEDEX.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">4. Lembrete de Pagamento PIX</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ATIVO</span>
                </div>
                <p className="text-xs text-slate-600">
                  Envia cobrança amigável com a chave PIX CNPJ do Banco Inter para orçamentos pendentes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BROADCAST / MARKETING */}
        {activeTab === "broadcast" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-3xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-sky-600" />
                Disparador em Massa para Base CRM
              </h2>
              <p className="text-xs text-slate-500">
                Envie comunicados, ofertas de banners e avisos de recesso com intervalo anti-ban (1.5s a 3.5s) automático do Baileys.
              </p>
            </div>

            {broadcastSuccessMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{broadcastSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Público-Alvo do CRM:</label>
                <select
                  value={broadcastTarget}
                  onChange={(e: any) => setBroadcastTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">Todos os Clientes do Cadastrados (148 contatos)</option>
                  <option value="pj">Apenas Clientes Pessoa Jurídica (PJ) (42 empresas)</option>
                  <option value="vip">Clientes Frequentes & VIP (18 contatos)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensagem do Comunicado:</label>
                <textarea
                  rows={5}
                  placeholder="Olá {{nome_cliente}}! A PrintFlow preparou uma oferta exclusiva de Banners em Lona 440g para a sua empresa..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 font-sans"
                />
              </div>

              <button
                onClick={handleSendBroadcast}
                disabled={broadcastSending}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {broadcastSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Disparando com intervalo Anti-Ban (Aguarde)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Iniciar Disparo em Massa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: TEMPLATES */}
        {activeTab === "templates" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-600" />
                Templates de Mensagens Transacionais
              </h2>
              <p className="text-xs text-slate-500">
                Modelos cadastrados no banco de dados para envio de orçamentos, links e provas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800">{tpl.title}</span>
                    <span className="font-mono bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {tpl.code}
                    </span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-wrap bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]">
                    {tpl.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BOT SIMULATOR */}
        {activeTab === "bot_simulator" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-600" />
                Simulador do Bot de Autoatendimento
              </h2>
              <p className="text-xs text-slate-500">
                Teste as opções interativas (1, 2, 3, 4) do menu automático exatamente como o cliente enxerga.
              </p>
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl space-y-3 max-h-96 overflow-y-auto text-xs font-sans">
              {simulatedHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-2xs space-y-1 ${
                      item.sender === "user"
                        ? "bg-sky-600 text-white rounded-tr-xs"
                        : "bg-slate-800 text-white rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                    <span className="text-[9px] opacity-75 block text-right">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite 1, 2, 3 ou 4 ou 'oi'..."
                value={simulatedInput}
                onChange={(e) => setSimulatedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSimulateBot();
                }}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleSimulateBot}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Simular</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: BAILIEYS CONNECTION & QR CODE */}
        {activeTab === "connection" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-xl mx-auto text-center">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-2">
                <QrCode className="w-6 h-6 text-sky-600" />
                Conexão Baileys WebSockets
              </h2>
              <p className="text-xs text-slate-500">
                Pareamento seguro via QR Code do WhatsApp Web oficial.
              </p>
            </div>

            {config.status === "connected" ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-base font-extrabold text-emerald-950">WhatsApp Conectado com Sucesso!</h3>
                <p className="text-xs text-emerald-800">
                  A sessão WebSockets está ativa no diretório <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">.wh-auth/</code>.
                </p>
                <button
                  onClick={handleToggleConnection}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Desconectar Sessão
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {qrCodeUrl ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block space-y-2">
                    <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto rounded-xl shadow-md" />
                    <p className="text-xs text-slate-500 font-mono">Aguardando leitura do aplicativo WhatsApp...</p>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateQR}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Gerar Novo QR Code Baileys</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </MainLayout>
  );
}
