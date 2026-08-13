"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Database,
  PlayCircle,
  StopCircle,
  Mail,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
  Send,
  Eye,
  Lock,
  Sparkles,
  Clock,
} from "lucide-react";

const KEY_PREFIX = "client_portal_";

export default function ClientPortalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demo, setDemo] = useState(false);
  const [demoPassword] = useState("123456");
  const [demoClients, setDemoClients] = useState<Array<{ id: string; name: string; document: string; email: string }>>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/admin/client-portal/config");
      const d = await r.json();
      setSettings(d.settings || {});
      setDemo(Boolean(d.demoMode));
      setDemoClients(d.demoClients || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (key: string, value: string) => {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/client-portal/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!r.ok) {
        const d = await r.json();
        setMsg({ type: "error", text: d.error || "Erro ao salvar." });
      } else {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setMsg({ type: "success", text: "Configuração salva." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Erro de conexão." });
    } finally {
      setSaving(false);
    }
  };

  const toggleDemo = async () => {
    setSaving(true);
    try {
      await save(`${KEY_PREFIX}demo_mode`, demo ? "false" : "true");
      setDemo(!demo);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const seedDemo = async () => {
    setSeeding(true);
    try {
      const r = await fetch("/api/admin/client-portal/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const d = await r.json();
      if (d.success) {
        setMsg({
          type: "success",
          text: `Demo populado: ${d.clientsCreated} cliente(s) e ${d.ordersCreated} pedido(s) criados.`,
        });
        await load();
      } else {
        setMsg({ type: "error", text: d.error || "Erro ao popular demo." });
      }
    } finally {
      setSeeding(false);
    }
  };

  const enterAsClient = async (document: string, name: string) => {
    try {
      const r = await fetch("/api/admin/client-portal/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enter", document }),
      });
      const d = await r.json();
      if (d.success) {
        // Abre o login do cliente em nova aba com o CPF pré-preenchido
        const otp = d.otp || "123456";
        const url = `/cliente/login?doc=${encodeURIComponent(document)}&demo_otp=${otp}`;
        window.open(url, "_blank");
      } else {
        setMsg({ type: "error", text: d.error || "Erro ao entrar." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Erro de conexão." });
    }
  };

  const resetSessions = async () => {
    if (!confirm("Encerrar TODAS as sessões de clientes? Eles precisarão fazer login novamente.")) return;
    setResetting(true);
    try {
      const r = await fetch("/api/admin/client-portal/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_sessions" }),
      });
      const d = await r.json();
      setMsg({ type: "success", text: `${d.sessionsDeleted || 0} sessão(ões) encerrada(s).` });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {msg && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 text-sm font-semibold ${
            msg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* MODO DEMO */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 text-white rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-purple-900">Modo Demo (Visualização Interna)</h3>
            <p className="text-xs text-purple-700">
              Ative para testar o portal do cliente por dentro. O código OTP volta na resposta
              e a senha sempre é <strong>{demoPassword}</strong> (somente dev/staging).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                demo ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {demo ? "ATIVADO" : "Desativado"}
              </p>
              <p className="text-[10px] text-slate-500">
                {demo
                  ? "Qualquer pessoa pode entrar com 123456 em qualquer cliente cadastrado"
                  : "Login real, OTP enviado por e-mail"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDemo}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              demo
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            {demo ? <StopCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            {demo ? "Desativar Demo" : "Ativar Demo"}
          </button>
        </div>

        {demo && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={seedDemo}
                disabled={seeding}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                Popular Banco com Dados Demo
              </button>
              <span className="text-[10px] text-purple-700">
                Cria clientes e pedidos fictícios para teste.
              </span>
            </div>

            {demoClients.length > 0 && (
              <div className="bg-white rounded-2xl border border-purple-200 p-3 space-y-2">
                <span className="text-[10px] font-extrabold text-purple-700 uppercase block">
                  Entrar como cliente demo (abre nova aba)
                </span>
                {demoClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => enterAsClient(c.document, c.name)}
                    className="w-full p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {c.document} • {c.email}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                      Entrar com {demoPassword} <Send className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-800">
              <strong>⚠ Atenção:</strong> Nunca ative o modo demo em produção. O código OTP
              fica visível nas respostas da API e qualquer pessoa pode fazer login como
              qualquer cliente cadastrado.
            </div>
          </div>
        )}
      </div>

      {/* Configurações de E-mail */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <Mail className="w-5 h-5 text-sky-600" /> E-mail do Portal
        </h3>
        <p className="text-xs text-slate-500">
          Quando o SMTP está configurado nas variáveis de ambiente do servidor, os OTPs são
          enviados por e-mail real. Caso contrário, são salvos no log do sistema (em
          /api/admin/client-portal/config).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              SMTP Host
            </label>
            <input
              defaultValue={settings.client_portal_smtp_host || process.env.SMTP_HOST || ""}
              onBlur={(e) => save("client_portal_smtp_host", e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              E-mail Remetente
            </label>
            <input
              defaultValue={settings.client_portal_smtp_from || process.env.SMTP_FROM || ""}
              onBlur={(e) => save("client_portal_smtp_from", e.target.value)}
              placeholder="noreply@printflow.com.br"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Segurança
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl">
            <Lock className="w-4 h-4 text-slate-500 mb-1" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Validade OTP</p>
            <p className="text-base font-black text-slate-800">5 min</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <Key className="w-4 h-4 text-slate-500 mb-1" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Máx tentativas</p>
            <p className="text-base font-black text-slate-800">3 erradas</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <Clock className="w-4 h-4 text-slate-500 mb-1" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Bloqueio</p>
            <p className="text-base font-black text-slate-800">15 min</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={resetSessions}
            disabled={resetting}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Encerrar Todas as Sessões de Clientes
          </button>
        </div>
      </div>

      {/* Documentação */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-600 space-y-1">
        <p className="font-bold text-slate-800">📚 Documentação do Portal do Cliente</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>URL pública: <code className="bg-white px-1 rounded">/portal</code></li>
          <li>Login: <code className="bg-white px-1 rounded">/cliente/login</code></li>
          <li>Dashboard: <code className="bg-white px-1 rounded">/cliente/dashboard</code></li>
          <li>Pedidos: <code className="bg-white px-1 rounded">/cliente/pedidos</code></li>
          <li>Aprovar arte: <code className="bg-white px-1 rounded">/cliente/arte/[id]</code></li>
          <li>Gabaritos: <code className="bg-white px-1 rounded">/cliente/gabaritos</code></li>
        </ul>
        <p className="pt-1">
          Os pedidos criados no sistema geram tokens públicos automaticamente (arte + rastreio),
          válidos por 14 dias e de uso único. Os links são enviados via WhatsApp pelo bot.
        </p>
      </div>
    </div>
  );
}
