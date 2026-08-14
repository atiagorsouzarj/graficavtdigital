"use client";

/**
 * OrderJourneyStepper (v3.3.4)
 * Jornada visual do pedido: do orçamento à entrega, seguindo o fluxo real
 * do sistema (Kanban de produção + aprovação de arte + pagamento).
 *
 * - Desktop: stepper horizontal com linha de progresso
 * - Mobile: timeline vertical
 * - Etapa atual pulsa; concluídas em verde; futuras em cinza
 */

import React from "react";
import {
  FileText,
  Palette,
  CreditCard,
  Printer,
  Scissors,
  PackageCheck,
  PartyPopper,
  Check,
} from "lucide-react";

export interface JourneyOrder {
  status: string;
  paymentStatus?: string;
  artApprovalStatus?: string;
  shippingMethod?: string;
}

interface Step {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    key: "quote",
    label: "Orçamento",
    shortLabel: "Orçamento",
    description: "Proposta criada e enviada para você",
    icon: FileText,
  },
  {
    key: "art",
    label: "Aprovação de Arte",
    shortLabel: "Arte",
    description: "Você confere e aprova o design",
    icon: Palette,
  },
  {
    key: "payment",
    label: "Pagamento",
    shortLabel: "Pagamento",
    description: "Confirmação do pagamento",
    icon: CreditCard,
  },
  {
    key: "printing",
    label: "Impressão",
    shortLabel: "Impressão",
    description: "Seu pedido está nas máquinas",
    icon: Printer,
  },
  {
    key: "finishing",
    label: "Acabamento",
    shortLabel: "Acabamento",
    description: "Corte, refile e acabamentos finais",
    icon: Scissors,
  },
  {
    key: "ready",
    label: "Pronto",
    shortLabel: "Pronto",
    description: "Aguardando retirada ou envio",
    icon: PackageCheck,
  },
  {
    key: "done",
    label: "Entregue",
    shortLabel: "Entregue",
    description: "Pedido concluído. Obrigado!",
    icon: PartyPopper,
  },
];

/**
 * Retorna o índice da etapa ATUAL (0-6) baseado nos status reais do sistema.
 */
export function getJourneyStage(order: JourneyOrder): number {
  const s = order.status;
  const paid = order.paymentStatus === "paid";
  const artOk =
    order.artApprovalStatus === "approved" ||
    ["production_ready", "in_printing", "finishing", "ready_for_pickup", "completed"].includes(s);

  if (s === "completed") return 6;
  if (s === "ready_for_pickup") return 5;
  if (s === "finishing") return 4;
  if (s === "in_printing") return 3;
  // production_ready: impressão é a próxima etapa
  if (s === "production_ready") return paid ? 3 : 2;
  // arte aprovada mas ainda não em produção → pagamento é o passo atual
  if (artOk) return 2;
  // aguardando aprovação de arte
  if (s === "art_approval" || s === "art_pending") return 1;
  // draft / sent
  return 0;
}

export default function OrderJourneyStepper({
  order,
  compact = false,
}: {
  order: JourneyOrder;
  compact?: boolean;
}) {
  const current = getJourneyStage(order);
  const isCancelled = order.status === "cancelled";
  const progressPct = (current / (STEPS.length - 1)) * 100;

  if (compact) {
    // Barra de progresso compacta (para cards de listagem)
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            {isCancelled ? "Cancelado" : `Etapa ${current + 1} de ${STEPS.length}`}
          </span>
          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isCancelled ? "text-red-500" : "text-sky-600"}`}>
            {isCancelled ? "—" : STEPS[current].shortLabel}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCancelled
                ? "bg-red-300"
                : current === STEPS.length - 1
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-sky-400 to-indigo-500"
            }`}
            style={{ width: isCancelled ? "100%" : `${Math.max(progressPct, 6)}%` }}
          />
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <span className="text-xs font-extrabold text-red-700 uppercase tracking-wide">
          Este pedido foi cancelado
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ===== DESKTOP: stepper horizontal ===== */}
      <div className="hidden md:block">
        <div className="relative px-2">
          {/* linha de fundo */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-slate-100 rounded-full" />
          {/* linha de progresso */}
          <div
            className="absolute top-6 left-8 h-1 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 rounded-full transition-all duration-1000"
            style={{ width: `calc(${progressPct} * (100% - 4rem) / 100)` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step, idx) => {
              const done = idx < current;
              const active = idx === current;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center w-24">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 relative ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                        : active
                        ? "bg-gradient-to-br from-sky-500 to-indigo-600 border-sky-400 text-white shadow-lg shadow-sky-200 scale-110"
                        : "bg-white border-slate-200 text-slate-300"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-2xl bg-sky-400/40 animate-ping" />
                    )}
                    {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5 relative z-10" />}
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-extrabold uppercase tracking-wide text-center leading-tight ${
                      done ? "text-emerald-600" : active ? "text-sky-700" : "text-slate-400"
                    }`}
                  >
                    {step.shortLabel}
                  </span>
                  {active && (
                    <span className="mt-0.5 text-[9px] text-slate-500 text-center leading-tight max-w-[90px]">
                      {step.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== MOBILE: timeline vertical ===== */}
      <div className="md:hidden space-y-0">
        {STEPS.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          const isLast = idx === STEPS.length - 1;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex gap-3">
              {/* coluna do ícone + linha */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 relative ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                      ? "bg-gradient-to-br from-sky-500 to-indigo-600 border-sky-400 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {active && <span className="absolute inset-0 rounded-xl bg-sky-400/40 animate-ping" />}
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4 relative z-10" />}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-6 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
              {/* texto */}
              <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                <span
                  className={`text-xs font-extrabold block ${
                    done ? "text-emerald-700" : active ? "text-sky-700" : "text-slate-400"
                  }`}
                >
                  {step.label}
                  {done && <span className="ml-1.5 text-[9px] font-bold text-emerald-500">✓ CONCLUÍDO</span>}
                  {active && (
                    <span className="ml-1.5 text-[9px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-md">
                      ETAPA ATUAL
                    </span>
                  )}
                </span>
                <span className={`text-[10px] ${active ? "text-slate-600" : "text-slate-400"}`}>
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
