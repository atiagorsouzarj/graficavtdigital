"use client";

import React, { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  CreditCard,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface OrderDetail {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingTrackingCode?: string;
  shippingAddress?: string;
  artApprovalStatus?: string;
  totalAmount: string;
  createdAt: string;
  items?: Array<{ productName: string; quantity: number; unitPrice: string }>;
}

export default function PublicOrderTrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("t");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ type: "expired" | "notoken" | "notfound"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!token) {
      setLoading(false);
      setError({
        type: "notoken",
        message: "Para acompanhar o seu pedido, use o link enviado pela gráfica ou entre na sua área de cliente.",
      });
      return;
    }

    fetch(`/api/cliente/rastreio/${encodeURIComponent(code)}?t=${encodeURIComponent(token)}`)
      .then((r) => {
        if (r.status === 410) {
          throw new Error("EXPIRED");
        }
        if (r.status === 404) {
          throw new Error("NOTFOUND");
        }
        if (!r.ok) {
          throw new Error("GENERIC");
        }
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message === "EXPIRED") {
          setError({ type: "expired", message: "Este link de rastreio expirou." });
        } else if (err.message === "NOTFOUND") {
          setError({ type: "notfound", message: "Pedido não encontrado." });
        } else {
          setError({ type: "notoken", message: "Link inválido. Solicite um novo pelo WhatsApp." });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code, token]);

  const timelineStages = [
    { key: "draft", label: "1. Pedido criado", done: true },
    { key: "sent", label: "2. Orçamento enviado", done: true },
    {
      key: "art_approval",
      label: "3. Arte aprovada",
      done:
        order?.artApprovalStatus === "approved" ||
        ["production_ready", "in_printing", "finishing", "ready_for_pickup", "completed"].includes(order?.status || ""),
    },
    { key: "paid", label: "4. Pagamento confirmado", done: order?.paymentStatus === "paid" },
    {
      key: "in_printing",
      label: "5. Em produção",
      done: ["in_printing", "finishing", "ready_for_pickup", "completed"].includes(order?.status || ""),
    },
    { key: "ready_for_pickup", label: "6. Pronto p/ entrega", done: ["ready_for_pickup", "completed"].includes(order?.status || "") },
    { key: "completed", label: "7. Despachado / Concluído", done: order?.status === "completed" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl w-fit">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-lg font-black text-white">
            {error?.type === "expired" ? "Link expirado" : "Acesso protegido"}
          </h1>
          <p className="text-sm text-slate-400">{error?.message}</p>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-4 sm:p-8">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl text-white">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white">RASTREIO DE PEDIDO</h1>
            <p className="text-xs text-sky-400 font-medium">PrintFlow Gráfica Criativa</p>
          </div>
        </div>
        <a
          href="/cliente/pedidos"
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Meus Pedidos
        </a>
      </header>

      <main className="max-w-3xl w-full mx-auto space-y-6 flex-1">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Código do Pedido</span>
              <span className="font-mono font-black text-2xl text-sky-400">{order.code}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pagamento</span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full inline-block mt-1 ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {order.paymentStatus === "paid" ? "✅ PAGO" : "⏳ PENDENTE"}
              </span>
            </div>
          </div>

          {order.shippingTrackingCode && (
            <div className="bg-sky-950/60 p-4 rounded-2xl border border-sky-500/40 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-sky-300 block font-bold">Código de Rastreio</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  {order.shippingTrackingCode}
                </span>
              </div>
              <a
                href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.shippingTrackingCode}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
              >
                Rastrear Correios <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Linha do tempo</h3>
            {timelineStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  stage.done
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      stage.done ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {stage.done ? "✓" : idx + 1}
                  </div>
                  <span className={`font-extrabold text-xs ${stage.done ? "text-white" : "text-slate-500"}`}>
                    {stage.label}
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${stage.done ? "text-emerald-400" : "text-slate-600"}`}>
                  {stage.done ? "Concluído" : "Aguardando"}
                </span>
              </div>
            ))}
          </div>

          {order.items && order.items.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 uppercase text-[10px] block">Itens do Pedido</span>
              <div className="divide-y divide-slate-800">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <span className="text-slate-200 font-medium">{item.quantity}x {item.productName}</span>
                    <span className="text-sky-400 font-mono font-bold">{formatCurrency(item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-3xl w-full mx-auto pt-6 text-center text-xs text-slate-500 border-t border-slate-900 mt-8">
        PrintFlow Gráfica Criativa • Acompanhamento em Tempo Real
      </footer>
    </div>
  );
}
