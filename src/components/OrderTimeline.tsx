"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Printer,
  Scissors,
  Package,
  Truck,
  AlertCircle,
  FileText,
  Palette,
} from "lucide-react";

export interface TimelineStage {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export const ORDER_TIMELINE: TimelineStage[] = [
  {
    key: "draft",
    label: "Pedido Recebido",
    description: "Seu pedido foi registrado em nosso sistema",
    icon: FileText,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  {
    key: "sent",
    label: "Orçamento Enviado",
    description: "Aguardando sua aprovação do orçamento",
    icon: Clock,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  {
    key: "art_approval",
    label: "Arte em Aprovação",
    description: "Prova digital enviada para sua aprovação",
    icon: Palette,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    key: "production_ready",
    label: "Pronto para Produção",
    description: "Arte aprovada, aguardando entrada na fila",
    icon: CheckCircle2,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    key: "in_printing",
    label: "Em Impressão",
    description: "Seu material está sendo impresso",
    icon: Printer,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    key: "finishing",
    label: "Acabamento",
    description: "Corte, dobra, lombada e acabamentos especiais",
    icon: Scissors,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  {
    key: "ready_for_pickup",
    label: "Pronto para Retirada",
    description: "Pedido embalado e disponível na loja",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    key: "completed",
    label: "Entregue / Concluído",
    description: "Pedido retirado ou enviado com sucesso",
    icon: Truck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
];

interface OrderTimelineProps {
  currentStatus: string;
  paymentStatus?: string;
  compact?: boolean;
  showConnector?: boolean;
}

export function OrderTimeline({
  currentStatus,
  paymentStatus,
  compact = false,
  showConnector = true,
}: OrderTimelineProps) {
  const currentIndex = ORDER_TIMELINE.findIndex(
    (s) => s.key === currentStatus || (currentStatus === "art_pending" && s.key === "art_approval")
  );

  const visibleStages = compact
    ? ORDER_TIMELINE.filter((_, idx) => {
        if (currentIndex < 3) return idx <= 3;
        if (currentIndex >= ORDER_TIMELINE.length - 2) return idx >= ORDER_TIMELINE.length - 4;
        return idx >= currentIndex - 1 && idx <= currentIndex + 1;
      })
    : ORDER_TIMELINE;

  const getStageStatus = (idx: number) => {
    if (idx < currentIndex) return "completed";
    if (idx === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className={`${compact ? "flex items-center gap-2 overflow-x-auto pb-2" : "space-y-0"}`}>
      {visibleStages.map((stage, idx) => {
        const realIdx = ORDER_TIMELINE.findIndex((s) => s.key === stage.key);
        const status = getStageStatus(realIdx);
        const Icon = stage.icon;

        if (compact) {
          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl min-w-[80px] ${
                status === "current" ? "bg-sky-50 border border-sky-200" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === "completed"
                    ? "bg-emerald-500 text-white"
                    : status === "current"
                    ? "bg-sky-600 text-white ring-4 ring-sky-100"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-[10px] font-bold text-center leading-tight ${
                  status === "current" ? "text-sky-700" : "text-slate-600"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        }

        return (
          <div key={stage.key} className="relative flex gap-4">
            {/* Connector line */}
            {showConnector && idx < visibleStages.length - 1 && (
              <div
                className={`absolute left-6 top-12 w-0.5 h-8 ${
                  status === "completed" ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                status === "completed"
                  ? "bg-emerald-500 text-white"
                  : status === "current"
                  ? `${stage.bgColor} ${stage.color} ring-4 ring-sky-100`
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {status === "completed" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : status === "current" ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-sm ${
                    status === "current" ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {stage.label}
                </span>
                {status === "current" && (
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-extrabold rounded-full uppercase">
                    Agora
                  </span>
                )}
                {status === "completed" && (
                  <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Concluído
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>

              {stage.key === "art_approval" && status === "current" && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Sua aprovação é necessária para liberar a produção
                  </p>
                </div>
              )}

              {stage.key === "ready_for_pickup" && status === "current" && paymentStatus !== "paid" && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ Pedido pronto! Aguardando pagamento para liberar retirada.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrderStatusBadge({
  status,
  paymentStatus,
}: {
  status: string;
  paymentStatus?: string;
}) {
  const stage = ORDER_TIMELINE.find(
    (s) => s.key === status || (status === "art_pending" && s.key === "art_approval")
  );

  if (!stage) return null;

  const Icon = stage.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${stage.bgColor} ${stage.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{stage.label}</span>
      {paymentStatus && paymentStatus !== "paid" && status === "ready_for_pickup" && (
        <span className="ml-1 text-red-600">— Aguardando Pagamento</span>
      )}
    </div>
  );
}
