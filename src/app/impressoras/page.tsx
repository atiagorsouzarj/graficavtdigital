"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Printer,
  Plus,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  Settings,
  Image as ImageIcon,
  Flame,
  Tag,
  Calculator,
  Barcode,
  Wrench,
  Percent,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DEFAULT_KONICA_C284E_CONSUMABLES,
  LaserConsumablesData,
  LaserCostCalculationResult,
  calculateLaserCostDetails,
} from "@/lib/laserPricingEngine";

interface PrinterRecord {
  id: string;
  name: string;
  brand: string;
  model: string;
  technology: string;
  fixedCostPerImp: string;
  maintenanceCostPerImp: string;
  coveragePercent: string;
  accumulatedClicks?: number;
  maxCylinderClicks?: number;
  consumablesData?: unknown;
}

export default function ImpressorasPage() {
  const [printersList, setPrintersList] = useState<PrinterRecord[]>([]);
  const [coverageSimPercent, setCoverageSimPercent] = useState<number>(20.0);

  const [laserConsumables] = useState<LaserConsumablesData>(
    DEFAULT_KONICA_C284E_CONSUMABLES
  );

  const fetchPrinters = async () => {
    try {
      const res = await fetch("/api/printers");
      const data = await res.json();
      if (Array.isArray(data)) setPrintersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const laserCalc: LaserCostCalculationResult = calculateLaserCostDetails({
    ...laserConsumables,
    coveragePercent: coverageSimPercent,
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              EQUIPAMENTOS DE IMPRESSÃO
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Impressoras & Custos por Clique</h1>
            <p className="text-xs text-slate-500">
              Configure toners, garrafas de tinta, ribbons e vida útil do cilindro por tecnologia de impressão.
            </p>
          </div>
        </div>

        {/* Dynamic Toner / Ink Coverage % Simulator Slider */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="font-extrabold text-xs text-sky-400 flex items-center gap-1.5 uppercase">
                <Percent className="w-4 h-4" /> SIMULADOR DE COBERTURA DE TINTA / TONER ({coverageSimPercent}%)
              </span>
              <p className="text-[11px] text-slate-400">
                Arraste o slider para ver como o custo por folha A3 varia de acordo com a área impressa.
              </p>
            </div>

            <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
              Custo Simulado A3 Color: {formatCurrency(laserCalc.costColorA3)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-300">
              <span>5% (Texto Simples / Linha)</span>
              <span>20% (Padrão Comercial / Logo)</span>
              <span>50% (Foto Colorida)</span>
              <span>80% (Chapado Total)</span>
            </div>

            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={coverageSimPercent}
              onChange={(e) => setCoverageSimPercent(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Printers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {printersList.map((printer) => {
            const accumulatedClicks = printer.accumulatedClicks || 18420;
            const maxClicks = printer.maxCylinderClicks || 50000;
            const usagePercent = Math.min(100, Math.round((accumulatedClicks / maxClicks) * 100));

            return (
              <div
                key={printer.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 text-xs"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 inline-block mb-1">
                      {printer.technology}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{printer.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {printer.brand} • {printer.model}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-100 text-slate-700 rounded-2xl shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                </div>

                {/* Cylinder / Maintenance Lifetime Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" /> Manutenção do Cilindro
                    </span>
                    <span className="font-mono text-slate-800">
                      {accumulatedClicks.toLocaleString()} / {maxClicks.toLocaleString()} clqs ({usagePercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${usagePercent}%` }}
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Fixed Click Cost */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">CUSTO FIXO CLIQUE</span>
                    <span className="font-mono font-black text-sky-700 text-sm">
                      {formatCurrency(parseFloat(printer.fixedCostPerImp))} / clique
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    ● ATIVA
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </MainLayout>
  );
}
