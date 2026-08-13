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
  Printer,
  FileCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TemplateItem {
  id: string;
  channel: string; // 'email' | 'whatsapp'
  code: string;
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

  // Email Test State
  const [testEmailAddress, setTestEmailAddress] = useState("cliente.exemplo@gmail.com");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Preview tab
  const [activeTab, setActiveTab] = useState<"editor" | "html_preview">("editor");

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

  const handleSelectTemplate = (tpl: TemplateItem) => {
    setSelectedTemplate(tpl);
    setTitleText(tpl.title);
    setSubjectText(tpl.subject || "");
    setBodyText(tpl.body);
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress.trim()) return;
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              COMUNICAÇÃO TRANSACIONAL
            </span>
            <h1 className="text-2xl font-bold text-slate-800">E-mail Transacional & Templates</h1>
            <p className="text-xs text-slate-500">
              Configure o layout corporativo dos e-mails de envio de orçamentos, aprovação de arte e recibos.
            </p>
          </div>
        </div>

        {/* Global Toast Alert */}
        {sendSuccess && (
          <div className="p-3.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>E-mail de teste disparado com sucesso para {testEmailAddress} via Servidor SMTP!</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Templates Roster (4 Cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-1">
              MODELOS CADASTRADOS NO BANCO
            </span>

            <div className="space-y-2">
              {templates.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`w-full p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{tpl.title}</span>
                      <span className="text-[9px] font-mono font-extrabold bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded-md">
                        {tpl.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-1">{tpl.subject || tpl.body}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor & HTML Preview (8 Cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
            
            {/* Sub-tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex gap-2 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "editor" ? "bg-sky-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Edit3 className="w-4 h-4" /> Editar Texto
                </button>
                <button
                  onClick={() => setActiveTab("html_preview")}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "html_preview" ? "bg-sky-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Eye className="w-4 h-4" /> Preview HTML Corporativo
                </button>
              </div>

              {/* Test Email Trigger */}
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="E-mail de teste..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono w-48"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingTest ? "Enviando..." : "Testar Disparo"}</span>
                </button>
              </div>
            </div>

            {/* TAB EDITOR */}
            {activeTab === "editor" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Título do Template:</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assunto do E-mail (Subject):</label>
                  <input
                    type="text"
                    value={subjectText}
                    onChange={(e) => setSubjectText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corpo da Mensagem (Suporta Varáveis Dinâmicas):</label>
                  <textarea
                    rows={8}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              /* TAB HTML PREVIEW */
              <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block text-center">
                  PREVIEW DO LAYOUT HTML QUE O CLIENTE RECEBE NO E-MAIL
                </span>

                <div className="bg-white rounded-2xl max-w-lg mx-auto shadow-md border border-slate-200 p-6 space-y-4 font-sans text-xs text-slate-800">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="font-black text-sky-700 text-base">VTDIGITAL ART STUDIO</h2>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Gráfica Rápida & Papelaria</span>
                    </div>
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      PED-000102
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">{subjectText || "Seu Orçamento / Prova Digital está Pronta!"}</h3>
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-600 text-xs">
                      {bodyText || "Olá Raphaela Pinheiro! Segue o link para conferência..."}
                    </p>
                  </div>

                  <div className="pt-2 text-center">
                    <a
                      href="#"
                      className="inline-block px-6 py-2.5 bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-md"
                    >
                      Acessar Portal do Cliente
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </MainLayout>
  );
}
