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
  const [smtpTestTo, setSmtpTestTo] = useState("");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  const testSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const r = await fetch("/api/admin/client-portal/smtp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: smtpTestTo }),
      });
      const d = await r.json();
      if (d.success) {
        setSmtpTestResult({ ok: true, text: d.message || "E-mail de teste enviado!" });
      } else {
        setSmtpTestResult({ ok: false, text: d.error || "Falha no teste SMTP." });
      }
    } catch {
      setSmtpTestResult({ ok: false, text: "Erro de conexão ao testar SMTP." });
    } finally {
      setSmtpTesting(false);
    }
  };

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
        const nothingNew = !d.clientsCreated && !d.ordersCreated;
        setMsg({
          type: "success",
          text: nothingNew
            ? "Dados demo já existem no banco — nada precisou ser criado. Use os botões abaixo para entrar."
            : `Demo populado: ${d.clientsCreated} cliente(s) e ${d.ordersCreated} pedido(s) criados.`,
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
        // Tenta abrir em nova aba; se o navegador/iframe bloquear popup, navega na mesma aba
        const win = window.open(url, "_blank");
        if (!win || win.closed || typeof win.closed === "undefined") {
          window.location.href = url;
        }
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
          <Mail className="w-5 h-5 text-sky-600" /> E-mail do Portal (SMTP)
        </h3>
        <p className="text-xs text-slate-500">
          Configure aqui o servidor SMTP para envio real dos códigos OTP. As configurações do
          painel têm prioridade; se vazias, o sistema usa as variáveis de ambiente
          (SMTP_HOST/SMTP_USER/SMTP_PASS). Sem nenhuma configuração, os e-mails ficam apenas no
          log do sistema e <strong>não são entregues</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              SMTP Host
            </label>
            <input
              defaultValue={settings.client_portal_smtp_host || ""}
              onBlur={(e) => save("client_portal_smtp_host", e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              Porta / Conexão
            </label>
            <div className="flex gap-2">
              <input
                defaultValue={settings.client_portal_smtp_port || "587"}
                onBlur={(e) => save("client_portal_smtp_port", e.target.value)}
                placeholder="587"
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              <select
                defaultValue={settings.client_portal_smtp_secure || "false"}
                onChange={(e) => save("client_portal_smtp_secure", e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="false">STARTTLS (porta 587)</option>
                <option value="true">SSL/TLS (porta 465)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              Usuário SMTP
            </label>
            <input
              defaultValue={settings.client_portal_smtp_user || ""}
              onBlur={(e) => save("client_portal_smtp_user", e.target.value)}
              placeholder="seuemail@gmail.com"
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              Senha SMTP (Senha de App)
            </label>
            <input
              type="password"
              defaultValue={settings.client_portal_smtp_pass || ""}
              onBlur={(e) => save("client_portal_smtp_pass", e.target.value)}
              placeholder="•••• •••• •••• ••••"
              autoComplete="new-password"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
              E-mail Remetente (From)
            </label>
            <input
              defaultValue={settings.client_portal_smtp_from || ""}
              onBlur={(e) => save("client_portal_smtp_from", e.target.value)}
              placeholder="VTDIGITAL ART STUDIO <noreply@vtdigital.site>"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Teste SMTP */}
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
            Testar envio real
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={smtpTestTo}
              onChange={(e) => setSmtpTestTo(e.target.value)}
              placeholder="seu-email@para-teste.com"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={testSmtp}
              disabled={smtpTesting || !smtpTestTo}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              {smtpTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Enviar e-mail de teste
                </>
              )}
            </button>
          </div>
          {smtpTestResult && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-xs font-semibold ${
                smtpTestResult.ok
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {smtpTestResult.ok ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span className="break-all">{smtpTestResult.text}</span>
            </div>
          )}
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
