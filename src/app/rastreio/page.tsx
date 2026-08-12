"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Truck, ArrowRight, PackageCheck } from "lucide-react";

export default function RastreioIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState("PV-0000101");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/rastreio/${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-sky-600/20 text-sky-400 rounded-2xl flex items-center justify-center mx-auto border border-sky-500/30">
          <Truck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider block">
            ACOMPANHAMENTO EM TEMPO REAL
          </span>
          <h1 className="text-2xl font-black text-white">Rastrear Pedido Gráfico</h1>
          <p className="text-xs text-slate-400">
            Digite o código do seu pedido (ex: PV-0000101 ou ORC-2026-009) para ver a fase de produção e rastreio.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Ex: PV-0000101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white font-mono font-bold outline-hidden focus:ring-2 focus:ring-sky-500 uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Consultar Status Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
