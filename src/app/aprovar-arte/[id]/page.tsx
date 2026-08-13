"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Palette,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck2,
  Send,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderDetail {
  id: string;
  code: string;
  clientName: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  artRejectionReason?: string;
  totalAmount: string;
  items?: Array<{ productName: string; quantity: number; paperMaterialName?: string }>;
}

export default function PublicArtApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ type: "expired" | "notfound" | "generic"; message: string } | null>(null);
  const [reason, setReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionDoneMsg, setActionDoneMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const fetchDetail = async () => {
    try {
      const url = token
        ? `/api/art-approval/${id}?token=${encodeURIComponent(token)}`
        : `/api/art-approval/${id}`;
      const res = await fetch(url);
      if (res.status === 410) {
        const data = await res.json().catch(() => ({}));
        setError({ type: "expired", message: data.error || "Link expirado." });
        return;
      }
      if (res.status === 404) {
        setError({ type: "notfound", message: "Prova de arte não encontrada." });
        return;
      }
      if (res.status === 401) {
        setError({ type: "generic", message: "Link de aprovação inválido. Solicite um novo pelo WhatsApp." });
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError({ type: "generic", message: "Erro de conexão." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, token]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!token) return;
    if (action === "reject" && !reason.trim()) {
      reasonRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/art-approval/${id}?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionDoneMsg(data.message);
        setShowRejectInput(false);
        setReason("");
        await fetchDetail();
      } else {
        setError({ type: "expired", message: data.error || "Erro ao processar." });
      }
    } catch (err) {
      setError({ type: "generic", message: "Erro de conexão." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl w-fit">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-lg font-black text-white">
            {error.type === "expired" ? "Link expirado" : "Link inválido"}
          </h1>
          <p className="text-sm text-slate-400">{error.message}</p>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/cliente/login"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center justify-center gap-1.5"
            >
              Entrar na Área do Cliente <ArrowRight className="w-3 h-3" />
            </a>
            <a
              href="/portal"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
            >
              Voltar ao Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-4 sm:p-8">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">PORTAL DE APROVAÇÃO DE ARTE</h1>
            <p className="text-xs text-sky-400 font-medium">PrintFlow Gráfica Criativa</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Pedido</span>
          <span className="font-mono font-bold text-sky-400 text-sm">{order.code}</span>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto space-y-6 flex-1">
        {actionDoneMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>{actionDoneMsg}</div>
          </div>
        )}

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Cliente: {order.clientName}</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.artApprovalStatus === "approved"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : order.artApprovalStatus === "changes_requested"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {order.artApprovalStatus === "approved"
                ? "✓ APROVADA"
                : order.artApprovalStatus === "changes_requested"
                ? "✕ AJUSTE SOLICITADO"
                : "PENDENTE"}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <img
              src={order.artMockupUrl || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80"}
              alt="Gabarito"
              className="max-h-96 mx-auto rounded-xl object-contain shadow-lg bg-white"
            />
            <div className="mt-3 text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <strong>Observações:</strong> {order.artNotes || "Sem observações."}
            </div>
          </div>

          {order.artApprovalStatus !== "approved" && (
            <div className="pt-2 space-y-3">
              {!showRejectInput ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={submitting}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-2xl text-xs font-bold border border-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-red-400" /> Solicitar Alteração
                  </button>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={submitting}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    APROVAR PARA IMPRESSÃO
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/40 space-y-3">
                  <label className="text-xs font-semibold text-red-300 block">O que precisa ser ajustado?</label>
                  <textarea
                    ref={reasonRef}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Corrigir o telefone..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setShowRejectInput(false); setReason(""); }}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={submitting || !reason.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-slate-800">
            💡 Dica: entre na sua <a href="/cliente/login" className="text-sky-400 hover:underline">Área do Cliente</a> para ver seus pedidos e gerenciar pagamentos.
          </div>
        </div>
      </main>
    </div>
  );
}
