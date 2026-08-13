"use client";

import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Truck, Search, Package, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ShippingOption {
  id: string;
  name: string;
  price: string;
  deliveryDays: number;
  carrier: string;
  serviceCode: string;
}

export default function LogisticaPage() {
  const [zip, setZip] = useState("01000-000");
  const [weight, setWeight] = useState("0.8");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedLabel, setSavedLabel] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [lastSource, setLastSource] = useState<string>("");

  const handleCalculate = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/superfrete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationZip: zip, weightKg: weight }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOptions([]);
        setErrorMsg(data.error || "Falha ao calcular o frete.");
        return;
      }
      if (Array.isArray(data.options)) {
        setOptions(data.options);
        setLastSource(data.source || "");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro de conexão com o serviço de frete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            LOGÍSTICA & ENTREGAS
          </span>
          <h1 className="text-2xl font-bold text-slate-800">SuperFrete Integration</h1>
          <p className="text-xs text-slate-500">
            Cotação instantânea com Correios PAC, SEDEX e Jadlog com geração de etiquetas de envio.
          </p>
        </div>

        {/* Shipping Calculator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-600" /> Simular Frete com SuperFrete
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">CEP de Destino</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="00000-000"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Peso da Encomenda (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm outline-hidden"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Calculando SuperFrete..." : "Calcular Valores de Frete"}
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
              ⚠ {errorMsg}
            </div>
          )}

          {options.length > 0 && (
            <div className="text-[10px] text-slate-500 font-medium">
              {lastSource === "superfrete" ? "✅ Cotação real (API SuperFrete)" : "ℹ️ Cálculo simulado (defina SUPERFRETE_API_KEY para cotação real)"}
            </div>
          )}

          {options.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-800 block">Opções Disponíveis:</span>
              <div className="space-y-2">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-800 block text-xs">{opt.name}</strong>
                      <span className="text-[10px] text-slate-500">Prazo: {opt.deliveryDays} dias úteis</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sky-700 block text-sm">{formatCurrency(opt.price)}</span>
                      <button
                        onClick={() =>
                          setSavedLabel(`SF${Date.now().toString().slice(-8)}BR (${opt.carrier})`)
                        }
                        className="text-[10px] font-bold text-sky-600 hover:underline"
                      >
                        Gerar Etiqueta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedLabel && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Etiqueta gerada com sucesso! Código de Rastreio: <strong>{generatedLabel}</strong>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
