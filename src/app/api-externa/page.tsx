"use client";

import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Code, Key, Copy, Check, PhoneCall, Bot } from "lucide-react";

export default function ApiExternaPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const keys = [
    { name: "Integração Telefonia VOIP", key: "gk_voip_89127391827391287319", perm: "Leitura / Pop-up Chamada" },
    { name: "Automação Comercial N8N / Webhooks", key: "gk_auto_1029381029381029381", perm: "Escrita / Pedidos" },
  ];

  const handleCopy = (k: string) => {
    navigator.clipboard.writeText(k);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 2000);
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
          </p>
        </div>

        {/* API Keys Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-600" /> Chaves de API Ativas (`X-API-Key`)
          </h3>

          <div className="space-y-2 text-xs">
            {keys.map((k, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">{k.name}</strong>
                  <span className="font-mono text-[11px] text-slate-500">{k.key}</span>
                </div>
                <button
                  onClick={() => handleCopy(k.key)}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === k.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === k.key ? "Copiado!" : "Copiar Key"}</span>
                </button>
              </div>
            ))}
          </div>
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
