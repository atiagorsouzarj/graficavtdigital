"use client";

import React, { useState, useEffect, use } from "react";
import { Palette, CheckCircle2, XCircle, AlertCircle, FileCheck2, Send, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderDetail {
  id: string;
  code: string;
  clientName: string;
  clientEmail: string;
  totalAmount: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  artApprovedAt?: string;
  artRejectionReason?: string;
  items?: Array<{ productName: string; quantity: number; paperMaterialName?: string }>;
}

export default function ClientArtApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionDoneMsg, setActionDoneMsg] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/art-approval/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAction = async (action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/art-approval/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      setActionDoneMsg(data.message);
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">PORTAL DE APROVAÇÃO DE ARTE</h1>
            <p className="text-xs text-sky-400 font-medium">Gráfica Rápida & Papelaria Personalizada</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Pedido</span>
          <span className="font-mono font-bold text-sky-400 block text-sm">{order?.code || "PV-0000101"}</span>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto space-y-6 flex-1">
        {actionDoneMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>{actionDoneMsg}</div>
          </div>
        )}

        {/* Artwork Visual Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Cliente: {order?.clientName || "Studio Design Ltda"}
              </h2>
              <p className="text-xs text-slate-400">
                Verifique atentamente os textos, telefones, ortografia e margens de corte antes da aprovação.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order?.artApprovalStatus === "approved"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : order?.artApprovalStatus === "changes_requested"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
              }`}
            >
              {order?.artApprovalStatus === "approved"
                ? "✓ ARTE APROVADA"
                : order?.artApprovalStatus === "changes_requested"
                ? "✕ ALTERAÇÃO SOLICITADA"
                : "PENDENTE DE APROVAÇÃO"}
            </span>
          </div>

          {/* High Res Artwork Proof */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative group">
            <img
              src={order?.artMockupUrl || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80"}
              alt="Gabarito de Impressão"
              className="max-h-96 mx-auto rounded-xl object-contain shadow-lg"
            />
            <div className="mt-3 text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <strong>Observações do Designer:</strong>{" "}
              {order?.artNotes || "Perfil de cor CMYK configurado. Margem de sangria de 2mm mantida."}
            </div>
          </div>

          {/* Action Buttons */}
          {order?.artApprovalStatus !== "approved" && (
            <div className="pt-2 space-y-3">
              {!showRejectInput ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-2xl text-xs font-bold border border-red-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    Solicitar Alteração / Corrigir Texto
                  </button>

                  <button
                    onClick={() => handleAction("approve")}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    APROVAR ARTE PARA IMPRESSÃO
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/40 space-y-3">
                  <label className="text-xs font-semibold text-red-300 block">
                    Descreva detalhadamente o que precisa ser ajustado:
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Corrigir número de telefone para (11) 98765-4321 e trocar a cor de fundo..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar Ajustes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto pt-6 text-center text-xs text-slate-500 border-t border-slate-900 mt-8">
        Gráfica Rápida & Papelaria Personalizada • Sistema de Prova Digital de Impressão
      </footer>
    </div>
  );
}
