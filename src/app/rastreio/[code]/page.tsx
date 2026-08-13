"use client";

import React, { useState, useEffect, use } from "react";
import {
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  Printer,
  Palette,
  CreditCard,
  MapPin,
  Search,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface OrderDetail {
  id: string;
  code: string;
  clientName: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  shippingTrackingCode?: string;
  shippingAddress?: string;
  createdAt: string;
  items?: Array<{ productName: string; quantity: number; unitPrice: string }>;
}

export default function PublicOrderTrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/orders?q=${encodeURIComponent(code)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao buscar pedido");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const found =
            data.find((o: any) => (o.code || "").toUpperCase() === code.toUpperCase()) || data[0];
          setOrder(found);
        } else {
          setOrder(null);
          setNotFound(true);
        }
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) {
          setOrder(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  // 7-Stage Order Status Stepper Timeline matching user's request
  const timelineStages = [
    { key: "draft", label: "1. Cadastro & Pedido Concluído", done: true },
    { key: "sent", label: "2. Orçamento Gerado", done: true },
    {
      key: "art_approval",
      label: "3. Arte Aprovada pelo Cliente",
      done: ["art_approval", "production_ready", "in_printing", "finishing", "ready_for_pickup", "completed"].includes(
        order?.status || "art_approval"
      ),
    },
    {
      key: "paid",
      label: "4. Pagamento Concluído",
      done: order?.paymentStatus === "paid",
    },
    {
      key: "in_printing",
      label: "5. Em Produção / Impressão Digital",
      done: ["in_printing", "finishing", "ready_for_pickup", "completed"].includes(
        order?.status || ""
      ),
    },
    {
      key: "ready_for_pickup",
      label: "6. Pronto para Entrega / Retirada",
      done: ["ready_for_pickup", "completed"].includes(order?.status || ""),
    },
    {
      key: "completed",
      label: "7. Despachado / Concluído",
      done: order?.status === "completed",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto p-4 bg-red-500/10 border border-red-500/40 rounded-2xl w-fit">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-lg font-black text-white">PEDIDO NÃO ENCONTRADO</h1>
          <p className="text-sm text-slate-400">
            Não localizamos nenhum pedido com o código{" "}
            <span className="font-mono font-bold text-sky-400">{code}</span>. Verifique se o código
            foi digitado corretamente ou entre em contato com a nossa equipe pelo WhatsApp.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/rastreio"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Buscar outro pedido
            </a>
            <a
              href="/"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl text-white">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white">RASTREIO DE PEDIDO EM TEMPO REAL</h1>
            <p className="text-xs text-sky-400 font-medium">PrintFlow Gráfica Criativa & Papelaria</p>
          </div>
        </div>

        <a
          href="/rastreio"
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Nova Busca
        </a>
      </header>

      <main className="max-w-3xl w-full mx-auto space-y-6 flex-1">
        {/* Main Status Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Código do Pedido</span>
              <span className="font-mono font-black text-2xl text-sky-400">{order.code}</span>
              <span className="text-xs text-slate-300 block font-bold mt-0.5">
                Cliente: {order.clientName}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Situação Financeira</span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full inline-block mt-1 ${
                  order?.paymentStatus === "paid"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {order?.paymentStatus === "paid" ? "✅ PAGAMENTO CONFIRMADO" : "⏳ PAGAMENTO PENDENTE"}
              </span>
            </div>
          </div>

          {/* Logistics Box (SuperFrete / Motoboy / Balcão) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase text-[10px] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-400" /> Modalidade de Entrega / Despacho
              </span>
              <span className="font-bold text-sky-400 uppercase">
                {order.shippingMethod || "Retirada no Balcão"}
              </span>
            </div>

            {order?.shippingTrackingCode ? (
              <div className="p-3 bg-sky-950/60 rounded-xl border border-sky-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-sky-300 block font-bold">Código de Rastreio SuperFrete:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {order.shippingTrackingCode}
                  </span>
                </div>
                <a
                  href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.shippingTrackingCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                >
                  Rastrear Correios <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className="text-slate-400 text-[11px]">
                Entrega via Retirada no Balcão ou Motoboy / Uber Flash local.
              </p>
            )}
          </div>

          {/* STEPPER TIMELINE (7 STAGES) */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
              Passo a Passo da Produção do Pedido
            </h3>

            <div className="space-y-2.5">
              {timelineStages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    stage.done
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        stage.done ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-slate-500"
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
          </div>

          {/* Order Items Summary */}
          {order?.items && order.items.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 uppercase text-[10px] block">
                Itens do Pedido ({order.items.length})
              </span>
              <div className="divide-y divide-slate-800">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <span className="text-slate-200 font-medium">{item.quantity}x {item.productName}</span>
                    <span className="font-bold text-sky-400 font-mono">{formatCurrency(item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-3xl w-full mx-auto pt-6 text-center text-xs text-slate-500 border-t border-slate-900 mt-8">
        PrintFlow Gráfica Criativa • Acompanhamento em Tempo Real do Pedido
      </footer>
    </div>
  );
}
