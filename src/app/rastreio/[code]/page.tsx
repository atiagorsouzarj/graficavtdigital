"use client";

import React, { use } from "react";
import { Truck, CheckCircle2, Clock, PackageCheck, Printer } from "lucide-react";

export default function PublicOrderTrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);

  const steps = [
    { label: "Orçamento & Pedido Recebido", done: true },
    { label: "Arte Aprovada pelo Cliente", done: true },
    { label: "Em Impressão / Produção", done: true },
    { label: "Acabamento e Corte", done: false },
    { label: "Despachado SuperFrete / Balcão", done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-400" />
            <h1 className="text-base font-bold text-white">RASTREIO DE PEDIDO</h1>
          </div>
          <span className="font-mono font-extrabold text-sky-400 text-sm">{code}</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Status Atual:</span>
            <span className="bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
              EM IMPRESSÃO DIGITIAL
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Rastreio SuperFrete:</span>
            <span className="font-mono font-bold text-emerald-400">SF982310844BR</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3 pt-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  step.done ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-500"
                }`}
              >
                {step.done ? "✓" : idx + 1}
              </div>
              <span className={`font-semibold ${step.done ? "text-white" : "text-slate-500"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
