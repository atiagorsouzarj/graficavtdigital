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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DEFAULT_KONICA_C284E_CONSUMABLES,
  LaserConsumablesData,
  LaserCostCalculationResult,
  calculateLaserCostDetails,
} from "@/lib/laserPricingEngine";
import {
  DEFAULT_EPSON_L18050_CONSUMABLES,
  InkjetConsumablesData,
  InkjetCostCalculationResult,
  calculateInkjetCostDetails,
} from "@/lib/inkjetPricingEngine";
import {
  DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES,
  SublimationConsumablesData,
  SublimationCostCalculationResult,
  calculateSublimationCostDetails,
} from "@/lib/sublimationPricingEngine";
import {
  DEFAULT_ELGIN_L42_PRO_CONSUMABLES,
  ThermalConsumablesData,
  ThermalCostCalculationResult,
  calculateThermalCostDetails,
} from "@/lib/thermalPricingEngine";

interface CategoryRecord {
  id: string;
  name: string;
  technology: string;
  description?: string;
}

interface PrinterRecord {
  id: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  brand: string;
  model: string;
  technology: string;
  fixedCostPerImp: string;
  maintenanceCostPerImp: string;
  coveragePercent: string;
  consumablesData?: unknown;
}

export default function ImpressorasPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [printersList, setPrintersList] = useState<PrinterRecord[]>([]);

  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [activePrinter, setActivePrinter] = useState<PrinterRecord | null>(null);

  // Consumables state per printer type
  const [laserConsumables, setLaserConsumables] = useState<LaserConsumablesData>(
    DEFAULT_KONICA_C284E_CONSUMABLES
  );
  const [inkjetConsumables, setInkjetConsumables] = useState<InkjetConsumablesData>(
    DEFAULT_EPSON_L18050_CONSUMABLES
  );
  const [sublimationConsumables, setSublimationConsumables] = useState<SublimationConsumablesData>(
    DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES
  );
  const [thermalConsumables, setThermalConsumables] = useState<ThermalConsumablesData>(
    DEFAULT_ELGIN_L42_PRO_CONSUMABLES
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal for new printer creation
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState("");
  const [newPrinterBrand, setNewPrinterBrand] = useState("Elgin");
  const [newPrinterModel, setNewPrinterModel] = useState("L42 Pro FULL");
  const [newPrinterCategory, setNewPrinterCategory] = useState("Impressora Térmica");
  const [newPrinterTech, setNewPrinterTech] = useState("thermal");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/printers");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
      if (Array.isArray(data.printers)) setPrintersList(data.printers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = (printer: PrinterRecord) => {
    setActivePrinter(printer);
    if (printer.technology === "thermal" || printer.categoryName?.includes("Térmica")) {
      if (printer.consumablesData) {
        setThermalConsumables(printer.consumablesData as ThermalConsumablesData);
      } else {
        setThermalConsumables(DEFAULT_ELGIN_L42_PRO_CONSUMABLES);
      }
    } else if (printer.technology === "sublimation" || printer.categoryName?.includes("Sublimação")) {
      if (printer.consumablesData) {
        setSublimationConsumables(printer.consumablesData as SublimationConsumablesData);
      } else {
        setSublimationConsumables(DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES);
      }
    } else if (printer.technology === "inkjet" || printer.categoryName?.includes("Jato")) {
      if (printer.consumablesData) {
        setInkjetConsumables(printer.consumablesData as InkjetConsumablesData);
      } else {
        setInkjetConsumables(DEFAULT_EPSON_L18050_CONSUMABLES);
      }
    } else {
      if (printer.consumablesData) {
        setLaserConsumables(printer.consumablesData as LaserConsumablesData);
      } else {
        setLaserConsumables(DEFAULT_KONICA_C284E_CONSUMABLES);
      }
    }
    setViewMode("detail");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setActivePrinter(null);
  };

  const isThermal =
    activePrinter?.technology === "thermal" || activePrinter?.categoryName?.includes("Térmica");
  const isSublimation =
    !isThermal &&
    (activePrinter?.technology === "sublimation" || activePrinter?.categoryName?.includes("Sublimação"));
  const isInkjet =
    !isThermal &&
    !isSublimation &&
    (activePrinter?.technology === "inkjet" || activePrinter?.categoryName?.includes("Jato"));

  // Calculations
  const laserCalc: LaserCostCalculationResult = calculateLaserCostDetails(laserConsumables);
  const inkjetCalc: InkjetCostCalculationResult = calculateInkjetCostDetails(inkjetConsumables);
  const sublimationCalc: SublimationCostCalculationResult =
    calculateSublimationCostDetails(sublimationConsumables);
  const thermalCalc: ThermalCostCalculationResult = calculateThermalCostDetails(thermalConsumables);

  // Handlers for Laser
  const handleLaserItemChange = (itemKey: string, field: "costPrice" | "yield5Percent", val: string) => {
    const nextItems = { ...laserConsumables.items };
    if (nextItems[itemKey]) {
      nextItems[itemKey] = {
        ...nextItems[itemKey],
        [field]: parseFloat(val) || 0,
      };
      setLaserConsumables({ ...laserConsumables, items: nextItems });
    }
  };

  // Handlers for Inkjet
  const handleInkjetItemChange = (itemKey: string, field: "costPrice" | "yield5Percent", val: string) => {
    const nextItems = { ...inkjetConsumables.items };
    if (nextItems[itemKey]) {
      nextItems[itemKey] = {
        ...nextItems[itemKey],
        [field]: parseFloat(val) || 0,
      };
      setInkjetConsumables({ ...inkjetConsumables, items: nextItems });
    }
  };

  // Handlers for Sublimation
  const handleSublimationItemChange = (itemKey: string, field: "costPrice" | "yield5Percent", val: string) => {
    const nextItems = { ...sublimationConsumables.items };
    if (nextItems[itemKey]) {
      nextItems[itemKey] = {
        ...nextItems[itemKey],
        [field]: parseFloat(val) || 0,
      };
      setSublimationConsumables({ ...sublimationConsumables, items: nextItems });
    }
  };

  // Handlers for Thermal
  const handleThermalItemChange = (itemKey: string, field: "costPrice" | "lengthMeters", val: string) => {
    const nextItems = { ...thermalConsumables.items };
    if (nextItems[itemKey]) {
      nextItems[itemKey] = {
        ...nextItems[itemKey],
        [field]: parseFloat(val) || 0,
      };
      setThermalConsumables({ ...thermalConsumables, items: nextItems });
    }
  };

  const handleSaveConsumables = async () => {
    if (!activePrinter) return;
    setSaving(true);
    try {
      const payloadData = isThermal
        ? thermalConsumables
        : isSublimation
        ? sublimationConsumables
        : isInkjet
        ? inkjetConsumables
        : laserConsumables;

      const res = await fetch(`/api/printers/${activePrinter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activePrinter.name,
          brand: activePrinter.brand,
          model: activePrinter.model,
          technology: activePrinter.technology,
          coveragePercent: isThermal ? 100 : (payloadData as any).coveragePercent,
          consumablesData: payloadData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isTherm = newPrinterTech === "thermal" || newPrinterCategory.includes("Térmica");
      const isSubli = newPrinterTech === "sublimation" || newPrinterCategory.includes("Sublimação");
      const isInk = newPrinterTech === "inkjet" || newPrinterCategory.includes("Jato");

      const defaultData = isTherm
        ? DEFAULT_ELGIN_L42_PRO_CONSUMABLES
        : isSubli
        ? DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES
        : isInk
        ? DEFAULT_EPSON_L18050_CONSUMABLES
        : DEFAULT_KONICA_C284E_CONSUMABLES;

      const res = await fetch("/api/printers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPrinterName || `${newPrinterBrand} ${newPrinterModel}`,
          brand: newPrinterBrand,
          model: newPrinterModel,
          categoryName: newPrinterCategory,
          technology: newPrinterTech,
          consumablesData: defaultData,
        }),
      });
      if (res.ok) {
        setShowNewModal(false);
        setNewPrinterName("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      {viewMode === "grid" ? (
        /* ================= VIEW 1: CATEGORIES & PRINTERS GRID ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
                PARQUE DE MÁQUINAS DA GRÁFICA
              </span>
              <h1 className="text-2xl font-bold text-slate-800">Impressoras & Máquinas</h1>
              <p className="text-xs text-slate-500">
                Categorias organizadas por tecnologia. Clique em qualquer impressora para editar a precificação individual de seus consumíveis.
              </p>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Cadastrar Impressora
            </button>
          </div>

          {/* Grouped by Category */}
          {[
            "Impressora Térmica",
            "Sublimação",
            "Jato de Tinta",
            "Laser Digital",
            "Plotter / Comunicação Visual",
          ].map((catName) => {
            const categoryPrinters = printersList.filter(
              (p) =>
                p.categoryName === catName ||
                (catName.includes("Térmica") && p.technology === "thermal") ||
                (catName.includes("Sublimação") && p.technology === "sublimation") ||
                (catName.includes("Laser") && p.technology === "laser") ||
                (catName.includes("Jato") && p.technology === "inkjet")
            );

            return (
              <div key={catName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    Categoria: {catName}
                  </h2>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {categoryPrinters.length} máquina(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPrinters.map((p) => {
                    const isPTherm = p.technology === "thermal" || p.categoryName?.includes("Térmica");
                    const isPSubli = !isPTherm && (p.technology === "sublimation" || p.categoryName?.includes("Sublimação"));
                    const isPInkjet = !isPTherm && !isPSubli && (p.technology === "inkjet" || p.categoryName?.includes("Jato"));

                    const costA4 = parseFloat(
                      p.fixedCostPerImp || (isPTherm ? "0.0650" : isPSubli ? "0.3395" : isPInkjet ? "0.0828" : "0.1341")
                    );

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-sky-400 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-slate-900 text-sky-400 rounded-xl">
                                {isPTherm ? (
                                  <Barcode className="w-5 h-5 text-purple-400" />
                                ) : isPSubli ? (
                                  <Flame className="w-5 h-5 text-amber-400" />
                                ) : (
                                  <Printer className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                  {p.brand} • {p.model}
                                </span>
                              </div>
                            </div>
                            <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {isPTherm ? "Ribbon Linear" : isPSubli ? "100% Fixado" : `${p.coveragePercent || 80}% Cobertura`}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Custo Base p/ Etiqueta:</span>
                              <span className="font-extrabold text-emerald-600">
                                {formatCurrency(costA4)}
                              </span>
                            </div>
                            {isPTherm && (
                              <div className="flex justify-between text-[11px] text-purple-700 font-bold">
                                <span>Custo por Metro Linear:</span>
                                <span>R$ 2,50 / metro</span>
                              </div>
                            )}
                            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                              <span>Consumível Principal:</span>
                              <span>{isPTherm ? "Ribbon (Cera, Misto, Resina Rosé)" : isPSubli ? "Gênesis 100ml" : "Epson 108 6 Cores"}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenDetail(p)}
                          className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-sky-400" />
                          <span>Editar Precificação & Consumíveis</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VIEW 2: FULL PAGE PRICING DETAILS ================= */
        <div className="space-y-5">
          {/* Header Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <button
                onClick={handleBackToGrid}
                className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Impressoras
              </button>
              <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider block">
                {isThermal
                  ? "CÁLCULO DE RIBBON POR METRO LINEAR E LOTE DE ETIQUETAS"
                  : isSublimation
                  ? "CÁLCULO DE TINTAS SUBLIMÁTICAS GÊNESIS (100ml) & RESÍDUO"
                  : isInkjet
                  ? "CÁLCULO DE REFIS E RESERVATÓRIO JATO DE TINTA"
                  : "CÁLCULO DE SUPRIMENTOS E MECÂNICA LASER"}
              </span>
              <h1 className="text-2xl font-black text-slate-800">
                Precificação da Impressora ({activePrinter?.name})
              </h1>
              <p className="text-xs text-slate-500">
                {isThermal
                  ? "Ajuste os tipos de Ribbon (Cera, Misto, Resina e Metálico Rosé/Prata/Dourado) e simule a tiragem do lote de etiquetas por metragem."
                  : isSublimation
                  ? "Ajuste os 4 frascos de tinta Gênesis Sublimática (100ml) e o feltro/reservatório de resíduo."
                  : isInkjet
                  ? "Ajuste os 6 refis de tinta, caixa de reservatório/manutenção e simule papéis fotográficos."
                  : "Ajuste preços, rendimentos e percentual de cobertura para cada um dos 14 consumíveis desta máquina."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveConsumables}
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Salvando..." : "Salvar Alterações de Preço"}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Valores atualizados e salvos com sucesso no banco de dados! Todos os produtos associados foram recalculados.
            </div>
          )}

          {/* ================= IMPRESSORA TÉRMICA (ELGIN L42 PRO FULL) PRICING PAGE ================= */}
          {isThermal ? (
            <div className="space-y-5">
              {/* TWO COLUMNS OF SUMMARY / SIMULATOR CARDS (As requested: "duas colunas para os cards fica mais organizado") */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Column 1: Active Ribbon & Batch Tiragem Controls */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                    <Barcode className="w-5 h-5 text-purple-600" />
                    <span>Configuração do Lote & Ribbon Selecionado</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Selecione o Ribbon para o Cálculo</label>
                    <select
                      value={thermalConsumables.selectedRibbonKey}
                      onChange={(e) =>
                        setThermalConsumables({ ...thermalConsumables, selectedRibbonKey: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      {Object.values(thermalConsumables.items)
                        .filter((i) => i.category === "ribbon")
                        .map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.name} ({formatCurrency(r.costPrice)} / {r.lengthMeters}m)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Metragem do Rolo (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={thermalConsumables.batchRollMeters}
                        onChange={(e) =>
                          setThermalConsumables({
                            ...thermalConsumables,
                            batchRollMeters: parseFloat(e.target.value) || 1,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">Ex: 26 metros de rolo</span>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Qtd de Etiquetas no Rolo</label>
                      <input
                        type="number"
                        value={thermalConsumables.batchLabelCount}
                        onChange={(e) =>
                          setThermalConsumables({
                            ...thermalConsumables,
                            batchLabelCount: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">Ex: 1000 etiquetas (5x5cm)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-purple-600" />
                      Regra Linear do Ribbon:
                    </p>
                    <p>
                      O Ribbon avança de forma contínua 1 para 1 com o rolo. Se o rolo tem {thermalConsumables.batchRollMeters}m, ele consome exatamente {thermalConsumables.batchRollMeters}m do Ribbon.
                    </p>
                  </div>
                </div>

                {/* Column 2: Dark Results Card (2 Columns Summary) */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Resultado Final por Etiqueta (Sem o Papel)
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                      Térmica Linear
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        CUSTO POR METRO LINEAR
                      </span>
                      <div className="text-lg font-black text-purple-400">
                        {formatCurrency(thermalCalc.ribbonCostPerMeter)}
                        <span className="text-[10px] text-slate-400 font-normal"> /metro</span>
                      </div>
                      <span className="text-[9px] text-slate-400 block">
                        Ribbon: {formatCurrency(thermalCalc.ribbonCostPrice)} ({thermalCalc.ribbonLengthMeters}m)
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        CUSTO RIBBON LOTE ({thermalConsumables.batchRollMeters}m)
                      </span>
                      <div className="text-lg font-black text-emerald-400">
                        {formatCurrency(thermalCalc.totalBatchRibbonCost)}
                      </div>
                      <span className="text-[9px] text-slate-400 block">
                        Para {thermalConsumables.batchLabelCount} etiquetas
                      </span>
                    </div>
                  </div>

                  {/* Main Highlight: Cost per Label */}
                  <div className="p-3.5 bg-purple-950/80 rounded-xl border border-purple-500/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-300 uppercase block">
                        CUSTO DE RIBBON POR ETIQUETA INDIVIDUAL
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Lote {thermalConsumables.batchRollMeters}m / {thermalConsumables.batchLabelCount} un
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white">
                      R$ {thermalCalc.costPerLabel.toFixed(4)}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-300">
                    <span>Desgaste da Cabeça Térmica (50km):</span>
                    <span className="font-bold text-white">R$ {thermalCalc.printheadWearCostPerMeter.toFixed(4)} / metro</span>
                  </div>
                </div>
              </div>

              {/* Editable Table: Ribbons List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Tabela de Ribbons e Cabeça de Impressão Térmica ELGIN L42 Pro
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Ribbon Ativo: {thermalCalc.activeRibbonName}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">MODELO / TIPO DE RIBBON</th>
                        <th className="p-2.5 text-center">METRAGEM ROLO (M)</th>
                        <th className="p-2.5 text-right">PREÇO ROLO (R$)</th>
                        <th className="p-2.5 text-right">CUSTO / METRO LINEAR</th>
                        <th className="p-2.5 text-right">CUSTO / ETIQUETA ({thermalConsumables.batchLabelCount}UN)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {Object.values(thermalConsumables.items).map((item) => {
                        const costPerM = item.lengthMeters > 0 ? item.costPrice / item.lengthMeters : 0;
                        const costPerLbl = (costPerM * thermalConsumables.batchRollMeters) / thermalConsumables.batchLabelCount;
                        const isSelected = thermalConsumables.selectedRibbonKey === item.key;

                        return (
                          <tr
                            key={item.key}
                            className={`transition-colors ${
                              isSelected ? "bg-purple-50/80 font-bold" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-2.5 font-bold text-slate-800 flex items-center gap-2">
                              {item.category === "ribbon" && (
                                <button
                                  onClick={() =>
                                    setThermalConsumables({ ...thermalConsumables, selectedRibbonKey: item.key })
                                  }
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${
                                    isSelected
                                      ? "bg-purple-600 border-purple-600 text-white"
                                      : "border-slate-400 bg-white"
                                  }`}
                                >
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </button>
                              )}
                              <span>{item.name}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                value={item.lengthMeters}
                                onChange={(e) => handleThermalItemChange(item.key, "lengthMeters", e.target.value)}
                                className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={item.costPrice}
                                onChange={(e) => handleThermalItemChange(item.key, "costPrice", e.target.value)}
                                className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500"
                              />
                            </td>
                            <td className="p-2.5 text-right font-bold text-purple-700 font-mono">
                              R$ {costPerM.toFixed(4)} /m
                            </td>
                            <td className="p-2.5 text-right font-bold text-emerald-700 font-mono">
                              R$ {costPerLbl.toFixed(4)} /un
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : isSublimation ? (
            /* ================= SUBLIMAÇÃO FULL PRICING PAGE ================= */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Fixed 100% Info & Dark Results Card */}
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <span>COBERTURA FIXADA EM 100%</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Impressões no papel transfer sublimático para prensagem térmica em canecas, camisetas e brindes são impressas em <strong>cobertura total (100% sangrada)</strong>.
                  </p>
                  <div className="p-2 bg-white/80 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-semibold">
                    Divisão CMYK: 25% de cobertura para cada cor (K, C, M, Y).
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Custo por Folha Sublimática
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase">
                      IMPRESSÃO SUBLIMÁTICA A4 (100% COBERTURA)
                    </span>
                    <div className="text-2xl font-black text-amber-400">
                      R$ {sublimationCalc.costColorA4.toFixed(4)}
                      <span className="text-xs text-slate-400 font-normal"> /folha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                      <span>Tintas Gênesis (4 Cores): R$ {sublimationCalc.totalInksCostA4.toFixed(4)}</span>
                      <span>Feltro Resíduo: R$ {sublimationCalc.feltPadCostA4.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase">
                      IMPRESSÃO SUBLIMÁTICA A3 (100% COBERTURA)
                    </span>
                    <div className="text-xl font-extrabold text-white">
                      R$ {sublimationCalc.costColorA3.toFixed(4)}
                      <span className="text-xs text-slate-400 font-normal"> /folha</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-300">
                    <span>Preto & Branco (P&B) A4:</span>
                    <span className="font-bold text-white">R$ {sublimationCalc.costMonoA4.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Tables */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      1. TINTAS SUBLIMÁTICAS GÊNESIS SUBLIDESK (100ml)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Subtotal Tintas @ 100%: R$ {sublimationCalc.totalInksCostA4.toFixed(4)} / A4
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">COR / REFIL</th>
                          <th className="p-2.5 text-center">RENDIMENTO BASE (5%)</th>
                          <th className="p-2.5 text-center">RENDIMENTO REAL (100%)</th>
                          <th className="p-2.5 text-right">PREÇO FRASCO 100ml (R$)</th>
                          <th className="p-2.5 text-right">CUSTO / FOLHA A4</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[
                          { key: "ink_k", label: "Tinta Gênesis Preta (100ml)", cost: sublimationCalc.inkCostK, badge: "bg-slate-800 text-white" },
                          { key: "ink_c", label: "Tinta Gênesis Ciano (100ml)", cost: sublimationCalc.inkCostC, badge: "bg-sky-100 text-sky-800" },
                          { key: "ink_m", label: "Tinta Gênesis Magenta (100ml)", cost: sublimationCalc.inkCostM, badge: "bg-pink-100 text-pink-800" },
                          { key: "ink_y", label: "Tinta Gênesis Amarela (100ml)", cost: sublimationCalc.inkCostY, badge: "bg-amber-100 text-amber-800" },
                        ].map((t) => {
                          const item = sublimationConsumables.items[t.key] || { yield5Percent: 2000, costPrice: 33.5 };
                          const realYield = Math.round((5 / 25) * item.yield5Percent);
                          return (
                            <tr key={t.key} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${t.badge}`}>
                                  {t.label}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={item.yield5Percent}
                                  onChange={(e) => handleSublimationItemChange(t.key, "yield5Percent", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                                />
                              </td>
                              <td className="p-2.5 text-center text-slate-600 font-mono font-bold">
                                {realYield.toLocaleString("pt-BR")} pág
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(e) => handleSublimationItemChange(t.key, "costPrice", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-bold text-amber-700 font-mono">
                                R$ {t.cost.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      2. ALMOFADAS DE RESÍDUO / FELTROS DE LIMPEZA (L3150)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Custo: R$ {sublimationCalc.feltPadCostA4.toFixed(4)} / folha
                    </span>
                  </div>

                  <div className="p-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">PEÇA / COMPONENTE</th>
                          <th className="p-2.5 text-center">DURABILIDADE (PÁGINAS)</th>
                          <th className="p-2.5 text-right">PREÇO KIT FELTROS (R$)</th>
                          <th className="p-2.5 text-right">CUSTO / FOLHA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const item = sublimationConsumables.items["felt_pad"] || { yield5Percent: 10000, costPrice: 45.0 };
                          return (
                            <tr className="hover:bg-slate-50 font-medium">
                              <td className="p-2.5 font-bold text-slate-800">
                                Kit Feltro / Almofadas de Resíduo Epson L3150
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={item.yield5Percent}
                                  onChange={(e) => handleSublimationItemChange("felt_pad", "yield5Percent", e.target.value)}
                                  className="w-28 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(e) => handleSublimationItemChange("felt_pad", "costPrice", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-bold text-amber-700 font-mono">
                                R$ {sublimationCalc.feltPadCostA4.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : isInkjet ? (
            /* ================= INKJET (JATO DE TINTA) FULL PRICING PAGE ================= */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-sky-600" /> Área de Cobertura Papéis A4/A3/A3+
                    </span>
                    <span className="text-sm font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      {inkjetConsumables.coveragePercent}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={inkjetConsumables.coveragePercent}
                    onChange={(e) =>
                      setInkjetConsumables({ ...inkjetConsumables, coveragePercent: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-sky-600 cursor-pointer"
                  />

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <p>
                      <strong>Divisão por cor (6 Tintas):</strong> {inkjetCalc.coveragePerColorPercent.toFixed(2)}% por cor.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Custo por Impressão (Jato de Tinta)
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      COLORIDA A4 ({inkjetConsumables.coveragePercent}% COBERTURA)
                    </span>
                    <div className="text-2xl font-black text-emerald-400">
                      R$ {inkjetCalc.costColorA4.toFixed(4)}
                      <span className="text-xs text-slate-400 font-normal"> /folha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                      <span>Tintas (6 Cores): R$ {inkjetCalc.totalInksCostA4.toFixed(4)}</span>
                      <span>Caixa Reservatório: R$ {inkjetCalc.wasteBoxCostA4.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Formato A3 Colorido:</span>
                      <span className="font-bold text-white">R$ {inkjetCalc.costColorA3.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formato A3+ (329x483mm) Colorido:</span>
                      <span className="font-bold text-white">R$ {inkjetCalc.costColorA3Plus.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-950/60 rounded-xl border border-purple-500/40 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-purple-200 text-xs border-b border-purple-800/60 pb-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>PAPÉIS FOTOGRÁFICOS (FORÇADO 100% COBERTURA)</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-purple-300 font-medium">Foto 10x15 cm (Sem borda):</span>
                        <span className="font-extrabold text-white">R$ {inkjetCalc.photo10x15Cost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300 font-medium">Foto 20x30 cm (A4 Fotográfico):</span>
                        <span className="font-extrabold text-white">R$ {inkjetCalc.photo20x30Cost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300 font-medium">Foto 30x40 cm (A3 Fotográfico):</span>
                        <span className="font-extrabold text-white">R$ {inkjetCalc.photo30x40Cost.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Inkjet Tables */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      1. GARRAFAS / REFIS DE TINTA (6 CORES - 70ml)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Subtotal Tintas: R$ {inkjetCalc.totalInksCostA4.toFixed(4)} / folha
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">COR / REFIL</th>
                          <th className="p-2.5 text-center">RENDIMENTO BASE (5%)</th>
                          <th className="p-2.5 text-center">RENDIMENTO REAL ({inkjetConsumables.coveragePercent}%)</th>
                          <th className="p-2.5 text-right">PREÇO GARRAFA (R$)</th>
                          <th className="p-2.5 text-right">CUSTO / FOLHA A4</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[
                          { key: "ink_k", label: "Tinta Preta (T1081)", cost: inkjetCalc.inkCostK, badge: "bg-slate-800 text-white" },
                          { key: "ink_c", label: "Tinta Ciano (T1082)", cost: inkjetCalc.inkCostC, badge: "bg-sky-100 text-sky-800" },
                          { key: "ink_m", label: "Tinta Magenta (T1083)", cost: inkjetCalc.inkCostM, badge: "bg-pink-100 text-pink-800" },
                          { key: "ink_y", label: "Tinta Amarela (T1084)", cost: inkjetCalc.inkCostY, badge: "bg-amber-100 text-amber-800" },
                          { key: "ink_lc", label: "Tinta Ciano Claro (T1085)", cost: inkjetCalc.inkCostLC, badge: "bg-cyan-100 text-cyan-800" },
                          { key: "ink_lm", label: "Tinta Magenta Claro (T1086)", cost: inkjetCalc.inkCostLM, badge: "bg-fuchsia-100 text-fuchsia-800" },
                        ].map((t) => {
                          const item = inkjetConsumables.items[t.key] || { yield5Percent: 1500, costPrice: 85.0 };
                          const realYield = Math.round((5 / inkjetCalc.coveragePerColorPercent) * item.yield5Percent);
                          return (
                            <tr key={t.key} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${t.badge}`}>
                                  {t.label}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={item.yield5Percent}
                                  onChange={(e) => handleInkjetItemChange(t.key, "yield5Percent", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-center text-slate-600 font-mono font-bold">
                                {realYield.toLocaleString("pt-BR")} pág
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(e) => handleInkjetItemChange(t.key, "costPrice", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-bold text-emerald-700 font-mono">
                                R$ {t.cost.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      2. CAIXA DE MANUTENÇÃO / RESERVATÓRIO DE RESÍDUO (C9345)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Custo: R$ {inkjetCalc.wasteBoxCostA4.toFixed(4)} / folha
                    </span>
                  </div>

                  <div className="p-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">PEÇA / COMPONENTE</th>
                          <th className="p-2.5 text-center">DURABILIDADE (PÁGINAS)</th>
                          <th className="p-2.5 text-right">PREÇO CAIXA (R$)</th>
                          <th className="p-2.5 text-right">CUSTO / FOLHA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const item = inkjetConsumables.items["waste_box"] || { yield5Percent: 15000, costPrice: 110.0 };
                          return (
                            <tr className="hover:bg-slate-50 font-medium">
                              <td className="p-2.5 font-bold text-slate-800">
                                Caixa de Manutenção C9345 com Chip
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={item.yield5Percent}
                                  onChange={(e) => handleInkjetItemChange("waste_box", "yield5Percent", e.target.value)}
                                  className="w-28 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(e) => handleInkjetItemChange("waste_box", "costPrice", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-bold text-sky-700 font-mono">
                                R$ {inkjetCalc.wasteBoxCostA4.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= LASER FULL PRICING PAGE ================= */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Slider & Dark Card */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-sky-600" /> Área de Cobertura Total
                    </span>
                    <span className="text-sm font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      {laserConsumables.coveragePercent}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={laserConsumables.coveragePercent}
                    onChange={(e) =>
                      setLaserConsumables({ ...laserConsumables, coveragePercent: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-sky-600 cursor-pointer"
                  />

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <p>
                      <strong>Divisão por cor (CMYK):</strong> {laserCalc.coveragePerColorPercent.toFixed(1)}% por cor.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Resultado Final por Impressão
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      COLORIDA A4 ({laserConsumables.coveragePercent}% COBERTURA)
                    </span>
                    <div className="text-2xl font-black text-emerald-400">
                      R$ {laserCalc.costColorA4.toFixed(4)}
                      <span className="text-xs text-slate-400 font-normal"> /folha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                      <span>Toners: R$ {laserCalc.totalTonersCostA4.toFixed(4)}</span>
                      <span>Peças: R$ {laserCalc.totalPartsCostA4.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      PRETO & BRANCO (P&B) A4
                    </span>
                    <div className="text-xl font-extrabold text-sky-400">
                      R$ {laserCalc.costMonoA4.toFixed(4)}
                      <span className="text-xs text-slate-400 font-normal"> /folha</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Formato A3 Colorido:</span>
                      <span className="font-bold text-white">R$ {laserCalc.costColorA3.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formato A3+ (SRA3) Colorido:</span>
                      <span className="font-bold text-white">R$ {laserCalc.costColorA3Plus.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Laser Editable Tables */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      1. TONERS E TINTAS (RENDIMENTO A 5% DE COBERTURA)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Subtotal: R$ {laserCalc.totalTonersCostA4.toFixed(4)} / folha
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">COR / MODELO</th>
                          <th className="p-2.5 text-center">RENDIMENTO (5%)</th>
                          <th className="p-2.5 text-center">RENDIMENTO REAL ({laserConsumables.coveragePercent}%)</th>
                          <th className="p-2.5 text-right">PREÇO (R$)</th>
                          <th className="p-2.5 text-right">CUSTO / FOLHA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[
                          { key: "toner_k", label: "Toner Preto (TN-321K)", cost: laserCalc.tonerCostK, badge: "bg-slate-800 text-white" },
                          { key: "toner_m", label: "Toner Magenta (TN-321M)", cost: laserCalc.tonerCostM, badge: "bg-pink-100 text-pink-800" },
                          { key: "toner_y", label: "Toner Amarelo (TN-321Y)", cost: laserCalc.tonerCostY, badge: "bg-amber-100 text-amber-800" },
                          { key: "toner_c", label: "Toner Ciano (TN-321C)", cost: laserCalc.tonerCostC, badge: "bg-sky-100 text-sky-800" },
                        ].map((t) => {
                          const item = laserConsumables.items[t.key] || { yield5Percent: 25000, costPrice: 193.0 };
                          const realYield = Math.round((5 / laserCalc.coveragePerColorPercent) * item.yield5Percent);
                          return (
                            <tr key={t.key} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${t.badge}`}>
                                  {t.label}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={item.yield5Percent}
                                  onChange={(e) => handleLaserItemChange(t.key, "yield5Percent", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-center text-slate-600 font-mono font-bold">
                                {realYield.toLocaleString("pt-BR")} pág
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(e) => handleLaserItemChange(t.key, "costPrice", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-bold text-emerald-700 font-mono">
                                R$ {t.cost.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      2. CILINDROS, REVELADORES, FUSÃO E BELT (MECÂNICA E FOTORRECETORES)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Subtotal: R$ {laserCalc.totalPartsCostA4.toFixed(4)} / folha
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">INSUMO / PEÇA</th>
                          <th className="p-2.5 text-center">DURABILIDADE (PÁG)</th>
                          <th className="p-2.5 text-right">PREÇO PEÇA (R$)</th>
                          <th className="p-2.5 text-right">CUSTO / FOLHA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[
                          { key: "cylinder_k", name: "Cilindro DR-311K (Preto)", cost: laserCalc.cylinderCostK },
                          { key: "cylinder_m", name: "Cilindro DR-311M (Magenta)", cost: laserCalc.cylinderCostM },
                          { key: "cylinder_y", name: "Cilindro DR-311Y (Amarelo)", cost: laserCalc.cylinderCostY },
                          { key: "cylinder_c", name: "Cilindro DR-311C (Ciano)", cost: laserCalc.cylinderCostC },
                          { key: "developer_k", name: "Revelador DV-512K (Preto)", cost: laserCalc.developerCostK },
                          { key: "developer_m", name: "Revelador DV-512M (Magenta)", cost: laserCalc.developerCostM },
                          { key: "developer_y", name: "Revelador DV-512Y (Amarelo)", cost: laserCalc.developerCostY },
                          { key: "developer_c", name: "Revelador DV-512C (Ciano)", cost: laserCalc.developerCostC },
                          { key: "fuser", name: "Unidade / Película de Fusão", cost: laserCalc.fuserCostA4 },
                          { key: "belt", name: "Belt (Correia de Transferência)", cost: laserCalc.beltCostA4 },
                        ].map((p) => {
                          const item = laserConsumables.items[p.key] || { yield5Percent: 100000, costPrice: 300.0 };
                          return (
                            <tr key={p.key} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={item.yield5Percent}
                                  onChange={(e) => handleLaserItemChange(p.key, "yield5Percent", e.target.value)}
                                  className="w-28 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={(e) => handleLaserItemChange(p.key, "costPrice", e.target.value)}
                                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-bold text-sky-700 font-mono">
                                R$ {p.cost.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Printer Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Nova Impressora</h3>
            <form onSubmit={handleCreatePrinter} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Categoria de Impressora</label>
                <select
                  value={newPrinterCategory}
                  onChange={(e) => {
                    setNewPrinterCategory(e.target.value);
                    if (e.target.value.includes("Térmica")) setNewPrinterTech("thermal");
                    else if (e.target.value.includes("Sublimação")) setNewPrinterTech("sublimation");
                    else if (e.target.value.includes("Jato")) setNewPrinterTech("inkjet");
                    else if (e.target.value.includes("Laser")) setNewPrinterTech("laser");
                    else if (e.target.value.includes("Plotter")) setNewPrinterTech("plotter");
                    else setNewPrinterTech("thermal");
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-medium"
                >
                  <option value="Impressora Térmica">Impressora Térmica</option>
                  <option value="Sublimação">Sublimação</option>
                  <option value="Jato de Tinta">Jato de Tinta</option>
                  <option value="Laser Digital">Laser Digital</option>
                  <option value="Plotter / Comunicação Visual">Plotter / Comunicação Visual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Elgin / Zebra / Epson / Konica"
                    value={newPrinterBrand}
                    onChange={(e) => setNewPrinterBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: L42 Pro FULL"
                    value={newPrinterModel}
                    onChange={(e) => setNewPrinterModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome Exibido da Máquina</label>
                <input
                  type="text"
                  placeholder="Ex: ELGIN L42 Pro FULL"
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
                >
                  Cadastrar Máquina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
