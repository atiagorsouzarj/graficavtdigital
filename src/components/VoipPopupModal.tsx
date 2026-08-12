"use client";

import React, { useState } from "react";
import { X, PhoneCall, User, ShoppingBag, FileText, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VoipPopupModalProps {
  onClose: () => void;
}

export default function VoipPopupModal({ onClose }: VoipPopupModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("(11) 98765-4321");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    client?: { name: string; document: string; type: string; email: string; phone: string; notes: string };
    message?: string;
  } | null>({
    found: true,
    client: {
      name: "Studio Design & Eventos Ltda",
      document: "12.345.678/0001-90",
      type: "PJ",
      email: "contato@studioeventos.com.br",
      phone: "(11) 98765-4321",
      notes: "Cliente VIP. Pedido de Cartão de Visita em andamento.",
    },
  });

  const handleLookup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/external?action=voip_lookup&phone=${encodeURIComponent(phoneNumber)}`, {
        headers: { "X-API-Key": "gk_voip_89127391827391287319" },
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl animate-pulse">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Chamada VoIP Recebida</h2>
            <p className="text-xs text-slate-500">Identificador automático de chamadas (Caller ID API)</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Número de telefone"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-sm outline-hidden"
            />
            <button
              onClick={handleLookup}
              disabled={loading}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer"
            >
              Consultar
            </button>
          </div>

          {result && result.found && result.client && (
            <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-800 text-sm">{result.client.name}</span>
                <span className="bg-purple-200 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {result.client.type}
                </span>
              </div>
              <div className="text-slate-600 space-y-1">
                <p>Doc: <strong className="font-mono text-slate-800">{result.client.document}</strong></p>
                <p>E-mail: {result.client.email}</p>
                <p className="text-purple-700 font-medium bg-white/80 p-2 rounded-lg border border-purple-100 mt-2">
                  Obs: {result.client.notes}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-purple-200 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">Pedido Ativo: PV-0000101</span>
                <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md">
                  Arte em Aprovação
                </span>
              </div>
            </div>
          )}

          {result && !result.found && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
              Número não localizado no cadastro. Clique em <strong>Novo Cliente</strong> para registrar.
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Atender e Fechar
          </button>
          <a
            href="/orcamentos"
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Abrir Ficha do Pedido
          </a>
        </div>
      </div>
    </div>
  );
}
