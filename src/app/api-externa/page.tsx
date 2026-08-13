"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Code, Key, Copy, Check, Plus, Trash2, ShieldCheck } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string;
  active: boolean;
  lastUsedAt?: string | null;
  createdAt: string;
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "Nunca utilizada";
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
};

export default function ApiExternaPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState("read");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setKeys(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCopy = (k: string) => {
    navigator.clipboard.writeText(k).catch(() => {
      /* clipboard pode falhar em http (sem HTTPS) */
    });
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setErrorMsg("Informe um nome para a chave.");
      return;
    }
    setCreating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, permissions: newPerms }),
      });
      if (res.ok) {
        setNewName("");
        await fetchKeys();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Erro ao criar chave.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revogar esta chave? Ela deixará de funcionar imediatamente.")) return;
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) await fetchKeys();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 max-w-4xl">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            INTEGRAÇÕES DE TERCEIROS
          </span>
          <h1 className="text-2xl font-bold text-slate-800">API Externa & Telefonia VoIP</h1>
          <p className="text-xs text-slate-500">
            Chaves de API REST para conectar com centrais telefônicas VoIP, automação n8n e ERPs externos.
            Envie a chave no header <code className="bg-slate-100 px-1 rounded">X-API-Key</code> ou
            <code className="bg-slate-100 px-1 rounded">Authorization: Bearer ...</code>.
          </p>
        </div>

        {/* Create new key */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-600" /> Criar nova chave de API
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da chave (ex: N8N Integração E-commerce)"
              className="bg-slate-50 border border-slate-300 rounded-lg p-2 sm:col-span-1 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={newPerms}
              onChange={(e) => setNewPerms(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="read">Leitura (read)</option>
              <option value="write">Escrita (write)</option>
              <option value="read,write">Leitura + Escrita (read,write)</option>
              <option value="voip">VoIP Lookup</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg p-2 font-bold transition-colors disabled:opacity-50"
            >
              {creating ? "Criando..." : "Gerar Chave"}
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
          )}
        </div>

        {/* API Keys List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-600" /> Chaves de API Ativas
          </h3>

          {keys.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Nenhuma chave cadastrada. Crie uma acima para integrar sistemas externos.
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="text-slate-800 block truncate">{k.name}</strong>
                    <code className="font-mono text-[10px] text-slate-500 break-all">{k.key}</code>
                    <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>Permissões: <strong className="text-slate-700">{k.permissions}</strong></span>
                      <span>Status: <strong className={k.active ? "text-emerald-600" : "text-red-600"}>{k.active ? "Ativa" : "Revogada"}</strong></span>
                      <span>Último uso: <strong className="text-slate-700">{formatDateTime(k.lastUsedAt)}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(k.key)}
                      className="px-2.5 py-1.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      {copiedKey === k.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === k.key ? "Copiado!" : "Copiar"}</span>
                    </button>
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
                      title="Revogar chave"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Endpoints Doc */}
        <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" /> Endpoints Disponíveis
          </h3>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">GET /api/v1/external?action=voip_lookup&phone=11987654321</span>
              <p className="text-slate-400 font-sans mt-1">Identifica o cliente que está ligando e retorna seus pedidos ativos para exibição na tela.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-sky-400 font-bold">GET /api/v1/external?action=list_orders</span>
              <p className="text-slate-400 font-sans mt-1">Sincronização de pedidos e fluxo de caixa.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold">POST /api/v1/external</span>
              <p className="text-slate-400 font-sans mt-1">Webhook para automação comercial externa (N8N, ERPs).</p>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Mantenha suas chaves em segredo. Quem tiver acesso a uma chave válida pode consultar seus clientes e pedidos.
            Revogue imediatamente caso desconfie de vazamento.
          </span>
        </div>
      </div>
    </MainLayout>
  );
}
