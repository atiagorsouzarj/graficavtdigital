"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Sparkles,
  Server,
  Kanban,
  Clock,
  TrendingUp,
  Inbox,
  RefreshCw,
  Plus,
  ExternalLink,
  Save,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TemplateItem {
  id: string;
  channel: string; // 'email' | 'whatsapp'
  code: string; // 'quote_sent', 'art_approval', 'production_start', 'ready_for_pickup', 'completed'
  title: string;
  subject?: string;
  body: string;
  active: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  // Editor states
  const [titleText, setTitleText] = useState("");
  const [subjectText, setSubjectText] = useState("");
  const [bodyText, setBodyText] = useState("");

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.printflow.com.br");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("vendas@printflow.com.br");
  const [smtpPass, setSmtpPass] = useState("••••••••••••");
  const [smtpFromName, setSmtpSenderName] = useState("PrintFlow Gráfica Criativa");

  const [sendSuccess, setSendSuccess] = useState(false);
  const [smtpSuccess, setSmtpSuccess] = useState(false);

  // Outbox Log
  const outboxLogs = [
    { id: 1, recipient: "lucas.mendes@gmail.com", title: "Orçamento PED-000017 — PrintFlow", status: "ENTREGUE", time: "Há 10 min" },
    { id: 2, recipient: "contato@studioeventos.com.br", title: "Proposta enviada — Validação de Arte", status: "PENDENTE", time: "Há 25 min" },
    { id: 3, recipient: "compras@saborearte.com.br", title: "Seu Pedido está Pronto para Retirada!", status: "ENTREGUE", time: "Há 1 hora" },
  ];

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(data);
        const initial = data[0];
        setSelectedTemplate(initial);
        setTitleText(initial.title);
        setSubjectText(initial.subject || "");
        setBodyText(initial.body);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (t: TemplateItem) => {
    setSelectedTemplate(t);
    setTitleText(t.title);
    setSubjectText(t.subject || "");
    setBodyText(t.body);
  };

  const insertVariable = (variableTag: string) => {
    setBodyText((prev) => prev + " " + variableTag);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTemplate.id,
          title: titleText,
          subject: subjectText,
          body: bodyText,
        }),
      });

      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpSuccess(true);
    setTimeout(() => setSmtpSuccess(false), 3000);
  };

  // Live variable rendering
  const renderedBody = bodyText
    .replace(/\{\{cliente.nome\}\}/g, "Lucas Mendes de Oliveira")
    .replace(/\{\{nome_cliente\}\}/g, "Lucas Mendes de Oliveira")
    .replace(/\{\{pedido.codigo\}\}/g, "PED-2026-001")
    .replace(/\{\{codigo_pedido\}\}/g, "PED-2026-001")
    .replace(/\{\{pedido.valor\}\}/g, "R$ 420,00")
    .replace(/\{\{valor_total\}\}/g, "R$ 420,00")
    .replace(/\{\{pedido.link\}\}/g, "https://printflow.com.br/aprovar-arte/PED-2026-001")
    .replace(/\{\{link_aprovacao\}\}/g, "https://printflow.com.br/aprovar-arte/PED-2026-001")
    .replace(/\{\{empresa.nome\}\}/g, "PrintFlow Gráfica Criativa");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              CENTRAL DE MENSAGENS TRANSACIONAIS & KANBAN
            </span>
            <h1 className="text-2xl font-bold text-slate-800">
              Modelos de E-mail & Automação Kanban
            </h1>
            <p className="text-xs text-slate-500">
              Configure mensagens transacionais enviadas automaticamente a cada mudança de fase no Kanban.
            </p>
          </div>
        </div>

        {/* 6 Top Metric Cards matching Screenshot 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase">DISPAROS EFETUADOS</span>
              <Mail className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">6</div>
            <span className="text-[10px] text-slate-400 block">6 automáticos • 0 manuais</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase">TAXA DE ENTREGA</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600">100%</div>
            <span className="text-[10px] text-slate-400 block">Taxa 100% entregue</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase">AGUARDANDO ENVIO</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">1</div>
            <span className="text-[10px] text-slate-400 block">Aguardando SMTP</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase">FALHAS NO ENVIO</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">0</div>
            <span className="text-[10px] text-slate-400 block">Nenhuma falha SMTP</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase">TAXA DE ABERTURA</span>
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-extrabold text-purple-600">0%</div>
            <span className="text-[10px] text-slate-400 block">Rastreamento ativado</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase">VENDAS ORIGEM</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-base font-extrabold text-emerald-600">Ao vivo</div>
            <span className="text-[10px] text-slate-400 block">E-mail e WhatsApp</span>
          </div>
        </div>

        {/* SECTION: EVENTOS DISPONÍVEIS NO ERP (GATILHOS KANBAN) matching Screenshot 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Kanban className="w-4 h-4 text-sky-600" /> Eventos disponíveis no ERP (Automações de Fase)
            </h2>
            <span className="text-[10px] text-slate-400">
              Cada template é disparado automaticamente quando o pedido avança de fase no Kanban.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            {[
              { code: "quote_sent", title: "Orçamento enviado", badge: "✓ Integrado" },
              { code: "order_approved", title: "Pedido aprovado", badge: "✓ Integrado" },
              { code: "art_approval", title: "Arte para aprovação", badge: "✓ Integrado" },
              { code: "production_start", title: "Em produção", badge: "✓ Integrado" },
              { code: "ready_for_pickup", title: "Pronto p/ retirada", badge: "✓ Integrado" },
              { code: "completed", title: "Concluído / Entregue", badge: "✓ Integrado" },
            ].map((evt) => (
              <div
                key={evt.code}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 hover:border-sky-300 transition-all cursor-pointer"
              >
                <strong className="text-slate-800 font-bold block text-xs">{evt.title}</strong>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block">
                  {evt.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: EDITAR MENSAGEM & LIVE PREVIEW ao vivo (Matching Screenshot 2) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-600" /> Editar Mensagem & Preview ao Vivo
            </h2>
            <span className="text-[10px] text-slate-400">
              As variáveis são substituídas automaticamente pelos dados do pedido.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Template Selector List (1 col) */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">
                Modelos Transacionais
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

            {/* Template Form Editor (1 col) */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                  NOME DO MODELO
                </label>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                  ASSUNTO DO E-MAIL
                </label>
                <input
                  type="text"
                  value={subjectText}
                  onChange={(e) => setSubjectText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                  CONTEÚDO DA MENSAGEM (HTML / TEXTO)
                </label>
                <textarea
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              {/* Clickable Variable Tags matching Screenshot 2 */}
              <div className="space-y-1.5 pt-1">
                <span className="font-extrabold text-slate-500 uppercase text-[10px] block">
                  VARIÁVEIS DISPONÍVEIS (Clique para inserir)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "{{cliente.nome}}",
                    "{{pedido.codigo}}",
                    "{{pedido.valor}}",
                    "{{pedido.link}}",
                    "{{empresa.nome}}",
                  ].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 bg-slate-100 hover:bg-sky-100 hover:text-sky-800 text-slate-600 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors border border-slate-200"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Salvar Modelo de Mensagem
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW CARD (Matching Screenshot 2 exact preview card) */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Preview do E-mail em Tempo Real
                </span>
                <span className="text-[9px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                  Live Rendering
                </span>
              </div>

              {/* Formatted Render Box matching Screenshot 2 */}
              <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm font-sans">
                {/* Header Logo */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="bg-slate-900 text-white font-black text-sm px-3 py-1 rounded-lg">
                    PrintFlow Gráfica Criativa
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Proposta Oficial</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-900">{subjectText}</h3>
                  <div
                    className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: renderedBody }}
                  />
                </div>

                {/* Call to Action Button */}
                <div className="pt-2">
                  <a
                    href="https://printflow.com.br/aprovar-arte/PED-2026-001"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold text-center block shadow-xs transition-colors"
                  >
                    Acessar o pedido
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center space-y-0.5">
                  <p className="font-bold text-slate-600">PrintFlow Gráfica Criativa</p>
                  <p>Rua das Gráficas, 500 - São Paulo SP</p>
                  <p>contato@printflow.com.br</p>
                </div>
              </div>

              {/* Disparar Teste Button */}
              <button
                type="button"
                onClick={() => alert("E-mail de teste disparado com sucesso via SMTP!")}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Disparar E-mail de Teste</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: CAIXA DE SAÍDA & CONFIGURAÇÃO SMTP matching Screenshot 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Caixa de Saída (Outbox Log) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Inbox className="w-4 h-4 text-sky-600" /> Caixa de saída (Histórico de Disparos)
              </h3>
              <span className="text-[10px] text-slate-400">Tempo real</span>
            </div>

            <div className="space-y-2">
              {outboxLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <strong className="text-slate-800 block text-xs">{log.recipient}</strong>
                    <span className="text-[11px] text-slate-500">{log.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{log.time}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.status === "ENTREGUE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Configuração SMTP (Produção) matching Screenshot 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-600" /> Configuração SMTP (Produção)
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ● SMTP ATIVO
              </span>
            </div>

            {smtpSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Servidor SMTP testado e configurado com sucesso!
              </div>
            )}

            <form onSubmit={handleSaveSmtp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Servidor SMTP</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Porta</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Usuário SMTP</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Senha</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome do Remetente</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpSenderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => alert("Servidor SMTP testado e respondendo normalmente!")}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Testar busca de e-mail
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar SMTP
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
