"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Palette,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";
import { formatCurrency } from "@/lib/utils";

interface Client { id: string; name: string; email: string; }
interface ArtOrder {
  id: string;
  code: string;
  clientName: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  artRejectionReason?: string;
  totalAmount: string;
  items?: Array<{ productName: string; quantity: number }>;
}

export default function ClienteArtePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [order, setOrder] = useState<ArtOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reason, setReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [me, orderRes] = await Promise.all([
        fetch("/api/cliente/me").then((r) => r.json()),
        fetch(`/api/cliente/pedidos/${id}`).then((r) => r.json()),
      ]);
      if (me.error) {
        router.push(`/cliente/login?redirect=/cliente/arte/${id}`);
        return;
      }
      setClient(me);
      if (orderRes.error) {
        setNotFound(true);
      } else {
        setOrder(orderRes);
      }
      setLoading(false);
    } catch (err) {
      setNotFound(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, router]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!id) return;
    if (action === "reject" && !reason.trim()) {
      setError("Descreva o que precisa ser ajustado.");
      reasonRef.current?.focus();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cliente/pedidos/${id}/aprovar-arte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao processar.");
        return;
      }
      setSuccess(data.message);
      setReason("");
      setShowRejectInput(false);
      await fetchData();
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <ClientAreaLayout clientName={client.name}>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-lg font-black text-slate-800">Prova de arte não encontrada</h1>
          <Link
            href="/cliente/pedidos"
            className="inline-block mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
          >
            Meus pedidos
          </Link>
        </div>
      </ClientAreaLayout>
    );
  }

  if (!order) return null;

  const isApproved = order.artApprovalStatus === "approved";

  return (
    <ClientAreaLayout clientName={client.name}>
      <div className="max-w-3xl mx-auto space-y-5">
        <Link
          href={`/cliente/pedidos/${order.id}`}
          className="text-xs text-slate-500 hover:text-sky-600 font-bold flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar ao pedido
        </Link>

        {success && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Pedido</span>
              <span className="font-mono font-black text-sky-700 text-base">{order.code}</span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                isApproved
                  ? "bg-emerald-100 text-emerald-800"
                  : order.artApprovalStatus === "changes_requested"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800 animate-pulse"
              }`}
            >
              {isApproved
                ? "✓ ARTE APROVADA"
                : order.artApprovalStatus === "changes_requested"
                ? "✕ AJUSTE SOLICITADO"
                : "PENDENTE APROVAÇÃO"}
            </span>
          </div>

          {/* Imagem da arte */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-center mb-4">
            <img
              src={
                order.artMockupUrl ||
                "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80"
              }
              alt="Prova de arte"
              className="max-h-96 mx-auto rounded-xl object-contain shadow-md bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-3 bg-white p-2 rounded-lg">
              <strong>Observações do designer:</strong>{" "}
              {order.artNotes || "Sem observações."}
            </p>
          </div>

          {!isApproved && (
            <div className="space-y-3">
              {!showRejectInput ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={submitting}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-red-700 rounded-2xl text-xs font-bold border border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Solicitar Ajuste
                  </button>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={submitting}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    APROVAR PARA IMPRESSÃO
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-red-200 space-y-3">
                  <label className="text-xs font-bold text-red-700 block">
                    O que precisa ser ajustado?
                  </label>
                  <textarea
                    ref={reasonRef}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Corrigir o telefone para (11) 98765-4321 e trocar a cor de fundo..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowRejectInput(false);
                        setReason("");
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={submitting || !reason.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Enviar Ajustes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isApproved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-900">Arte aprovada!</p>
              <p className="text-xs text-emerald-700 mt-1">
                Seu pedido foi encaminhado para a fila de produção.
              </p>
            </div>
          )}
        </div>
      </div>
    </ClientAreaLayout>
  );
}
