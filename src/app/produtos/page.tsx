"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Percent,
  DollarSign,
  Layers,
  ArrowLeft,
  Save,
  Sparkles,
  Sliders,
  Boxes,
  Info,
  Tag,
  Settings,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DEFAULT_PRODUCT_COMPOSITIONS,
  YIELD_MATRIX_PRESETS,
  ProductComponentItem,
  ProductCompositionData,
  ProductPricingCalculationResult,
  calculateProductPricingDetails,
} from "@/lib/productPricingEngine";

interface ProductRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  salesUnit: string;
  calculatedBaseCost: string;
  costWithLoss: string;
  suggestedPrice: string;
  minSellPrice: string;
  overrideSellPrice?: string;
  targetMarginPercent: string;
  lossMarginPercent: string;
  taxPercent: string;
  cardTaxPercent: string;
  compositionData?: ProductCompositionData;
  calculationDetails?: ProductPricingCalculationResult;
}

export default function ProdutosPage() {
  const [productsList, setProductsList] = useState<ProductRecord[]>([]);

  // View state: 'grid' or 'detail' (Full-page BOM pricing editor)
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [activeProduct, setActivePrinterProduct] = useState<ProductRecord | null>(null);

  // Editable composition data
  const [compositionData, setCompositionData] = useState<ProductCompositionData>(
    DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal for new product
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("grafica_rapida");
  const [newProdPreset, setNewProdCategoryPreset] = useState("cartao_visita");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProductsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDetail = (product: ProductRecord) => {
    setActivePrinterProduct(product);
    if (product.compositionData) {
      setCompositionData(product.compositionData);
    } else {
      setCompositionData(DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita);
    }
    setViewMode("detail");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setActivePrinterProduct(null);
  };

  // Live calculation of product pricing
  const calc = calculateProductPricingDetails(compositionData);

  // Component change handlers
  const handleComponentChange = (
    idx: number,
    field: keyof ProductComponentItem,
    value: string
  ) => {
    const nextComponents = [...compositionData.components];
    if (nextComponents[idx]) {
      if (field === "quantityConsumed" || field === "unitCost") {
        const num = parseFloat(value) || 0;
        (nextComponents[idx] as any)[field] = num;
      } else {
        (nextComponents[idx] as any)[field] = value;
      }
      setCompositionData({ ...compositionData, components: nextComponents });
    }
  };

  const handleAddComponent = () => {
    const newComp: ProductComponentItem = {
      id: `c_${Date.now()}`,
      category: "insumo",
      sku: "INS-NOVO",
      name: "Novo Insumo / Processo",
      unit: "FLS",
      quantityConsumed: 1.0,
      unitCost: 0.5,
    };
    setCompositionData({
      ...compositionData,
      components: [...compositionData.components, newComp],
    });
  };

  const handleRemoveComponent = (idx: number) => {
    const nextComponents = compositionData.components.filter((_, i) => i !== idx);
    setCompositionData({ ...compositionData, components: nextComponents });
  };

  const handleSaveProduct = async () => {
    if (!activeProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${activeProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeProduct.code,
          name: activeProduct.name,
          category: activeProduct.category,
          lossMarginPercent: compositionData.lossMarginPercent,
          taxPercent: compositionData.taxPercent,
          cardTaxPercent: compositionData.cardTaxPercent,
          targetMarginPercent: compositionData.targetMarginPercent,
          compositionData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sample =
        DEFAULT_PRODUCT_COMPOSITIONS[newProdPreset] || DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newProdCode || `PROD-${Date.now().toString().slice(-6)}`,
          name: newProdName,
          category: newProdCategory,
          compositionData: sample,
        }),
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewProdName("");
        setNewProdCode("");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      {viewMode === "grid" ? (
        /* ================= VIEW 1: CATEGORIES & PRODUCTS GRID ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
                CATÁLOGO & FORMATAÇÃO DE PREÇOS
              </span>
              <h1 className="text-2xl font-bold text-slate-800">Produtos & Fichas Técnicas (BOM)</h1>
              <p className="text-xs text-slate-500">
                Aprovação de custos de materiais + clique de máquinas + margem de erro + impostos e taxa de cartão.
              </p>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Cadastrar Novo Produto
            </button>
          </div>

          {/* Grouped by Product Category */}
          {[
            { id: "grafica_rapida", label: "Gráfica Rápida (Cartões, Panfletos, Pastas)" },
            { id: "papelaria_personalizada", label: "Papelaria Personalizada (Caixas, Festas, Agendas)" },
            { id: "comunicacao_visual", label: "Comunicação Visual (Banners, Adesivos M², Placas)" },
            { id: "brindes", label: "Brindes & Etiquetas Rótulos" },
          ].map((cat) => {
            const catProducts = productsList.filter((p) => p.category === cat.id);

            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    Categoria: {cat.label}
                  </h2>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {catProducts.length} produto(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((p) => {
                    const baseCost = p.calculationDetails?.baseCompositionCost || parseFloat(p.calculatedBaseCost || "3.65");
                    const finalPrice = p.overrideSellPrice || p.suggestedPrice;
                    const salesUnit = p.salesUnit || "CT";

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-sky-400 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[10px] text-sky-700 font-extrabold uppercase bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 block w-fit mb-1">
                                {p.code}
                              </span>
                              <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{p.name}</h3>
                            </div>
                            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {salesUnit}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Custo Base Composição:</span>
                              <span className="font-mono font-bold text-slate-800">
                                R$ {baseCost.toFixed(4)}
                              </span>
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-600">
                              <span>Perda Impressão ({p.lossMarginPercent || "5"}%):</span>
                              <span>+ {formatCurrency(p.calculationDetails?.lossMarginAmount || 0.18)}</span>
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-600 border-t border-slate-200 pt-1">
                              <span>Imposto ({p.taxPercent || "6"}%) + Maquininha ({p.cardTaxPercent || "3.16"}%):</span>
                              <span className="font-semibold text-purple-700">
                                {(parseFloat(p.taxPercent || "6") + parseFloat(p.cardTaxPercent || "3.16")).toFixed(2)}%
                              </span>
                            </div>

                            <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                              <span>Margem Lucro:</span>
                              <span>{p.targetMarginPercent}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Preço de Venda ({salesUnit}):</span>
                            <span className="text-lg font-black text-emerald-400">
                              {formatCurrency(finalPrice)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenDetail(p)}
                            className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Editar Ficha Técnica & Precificação</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VIEW 2: FULL PAGE REAL-TIME BOM & PRICING EDITOR ================= */
        <div className="space-y-5">
          {/* Top Navigation & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <button
                onClick={handleBackToGrid}
                className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
              </button>
              <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider block">
                ENGENHARIA DE PRODUTO & FICHA TÉCNICA (BOM)
              </span>
              <h1 className="text-2xl font-black text-slate-800">
                Ficha Técnica e Precificação ({activeProduct?.name})
              </h1>
              <p className="text-xs text-slate-500">
                Ajuste os componentes fracionados (com até 4 casas decimais), margem de perda por erro, impostos e taxa de cartão InfinitePay.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveProduct}
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Salvando..." : "Salvar Precificação e Ficha Técnica"}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Ficha Técnica e precificação salvas com sucesso no banco de dados!
            </div>
          )}

          {/* Main Product Composition & Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column: Yield Matrix, Loss Margin, Tax, Dark Card & Tiered Quantity Discounts */}
            <div className="space-y-4">
              {/* Matrix Yield Presets & Sales Unit */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-600" /> Matriz de Aproveitamento A3
                  </span>
                  <span className="bg-sky-100 text-sky-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                    Unidade: {compositionData.salesUnit || "CT"}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Formato / Aproveitamento A3</label>
                  <select
                    value={compositionData.yieldPerA3Sheet}
                    onChange={(e) => {
                      const yieldNum = parseInt(e.target.value, 10) || 1;
                      const preset = YIELD_MATRIX_PRESETS.find((m) => m.yieldPerSheet === yieldNum);
                      const factor = preset ? preset.factor : parseFloat((1 / yieldNum).toFixed(4));
                      setCompositionData({
                        ...compositionData,
                        yieldPerA3Sheet: yieldNum,
                        yieldFactor: factor,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500"
                  >
                    {YIELD_MATRIX_PRESETS.map((m) => (
                      <option key={m.yieldPerSheet} value={m.yieldPerSheet}>
                        {m.label} ➔ {m.yieldPerSheet} un/folha (Fator: {m.factor})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Qtd por Folha A3:</span>
                    <strong className="text-slate-800">{compositionData.yieldPerA3Sheet} unidades</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fator de Custo/Clique:</span>
                    <strong className="text-sky-700 font-mono">{compositionData.yieldFactor}</strong>
                  </div>
                </div>
              </div>

              {/* Loss Margin, Tax & Card Fees */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Percent className="w-4 h-4 text-purple-600" /> Taxas Tributárias e Margens (%)
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Perda / Erro Impressão (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={compositionData.lossMarginPercent}
                      onChange={(e) =>
                        setCompositionData({ ...compositionData, lossMarginPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Margem de Segurança</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Imposto / Simples (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={compositionData.taxPercent}
                      onChange={(e) =>
                        setCompositionData({ ...compositionData, taxPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Nota Fiscal / Impostos</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Maquininha InfinitePay (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={compositionData.cardTaxPercent}
                      onChange={(e) =>
                        setCompositionData({ ...compositionData, cardTaxPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Taxa de Crédito/Débito</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Margem de Lucro (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={compositionData.targetMarginPercent}
                      onChange={(e) =>
                        setCompositionData({ ...compositionData, targetMarginPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-emerald-700 outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Lucro Bruto Alvo</span>
                  </div>
                </div>
              </div>

              {/* Dark Calculation Summary Panel */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Resultado Final do Produto
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {compositionData.salesUnit}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    CUSTO BASE DA COMPOSIÇÃO (BOM)
                  </span>
                  <div className="text-lg font-black text-slate-200 font-mono">
                    R$ {calc.baseCompositionCost.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
                    <span>Com Perda ({compositionData.lossMarginPercent}%):</span>
                    <span className="font-bold text-slate-300">R$ {calc.costWithLoss.toFixed(4)}</span>
                  </div>
                </div>

                {/* SUGGESTED SELLING PRICE */}
                <div className="p-3.5 bg-emerald-950/80 rounded-xl border border-emerald-500/50 space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold block uppercase">
                    PREÇO DE VENDA SUGERIDO ({compositionData.salesUnit})
                  </span>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatCurrency(calc.suggestedPrice)}
                  </div>
                  <div className="text-[10px] text-emerald-200 pt-1 flex justify-between">
                    <span>Lucro Bruto Estimado:</span>
                    <span className="font-extrabold">{formatCurrency(calc.profitAmount)} ({calc.profitRealPercent.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Preço Mínimo Protegido:</span>
                    <span className="font-bold text-white">{formatCurrency(calc.minSellPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Imposto ({compositionData.taxPercent}%):</span>
                    <span className="font-semibold text-purple-300">{formatCurrency(calc.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Maquininha ({compositionData.cardTaxPercent}%):</span>
                    <span className="font-semibold text-purple-300">{formatCurrency(calc.cardTaxAmount)}</span>
                  </div>
                </div>
              </div>

              {/* TIERED QUANTITY PRICING MATRIX BOX */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" /> Tabela de Desconto por Quantidade (Escala de Volume)
                </span>

                <div className="space-y-1.5">
                  {calc.quantityTierTable.map((tier, tidx) => (
                    <div
                      key={tidx}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono"
                    >
                      <div>
                        <strong className="text-slate-800 block text-xs">{tier.qty} {compositionData.salesUnit}s</strong>
                        <span className="text-[10px] text-emerald-600 font-bold">{tier.discountPercent}% desc.</span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">{formatCurrency(tier.unitPrice)} un</span>
                        <strong className="text-sky-700 text-xs">{formatCurrency(tier.totalPrice)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Editable Ficha Técnica / BOM Composition Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Ficha Técnica Unificada (BOM) — Composição do Produto
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Qtd. Consumida suporta até 4 casas decimais (DECIMAL(10,4)) para tiragens exatas de cartões, adesivos e caixas.
                    </p>
                  </div>

                  <button
                    onClick={handleAddComponent}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>+ Componente</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/60 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">CATEGORIA</th>
                        <th className="p-2.5">SKU / COMPONENTE</th>
                        <th className="p-2.5 text-center">UNIDADE</th>
                        <th className="p-2.5 text-center">QTD. CONSUMIDA (4 DEC)</th>
                        <th className="p-2.5 text-right">CUSTO UN (R$)</th>
                        <th className="p-2.5 text-right">CUSTO COMPOSIÇÃO</th>
                        <th className="p-2.5 text-center">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {compositionData.components.map((comp, idx) => {
                        const totalCompCost = comp.quantityConsumed * comp.unitCost;

                        return (
                          <tr key={comp.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5">
                              <select
                                value={comp.category}
                                onChange={(e) =>
                                  handleComponentChange(idx, "category", e.target.value)
                                }
                                className="bg-slate-50 border border-slate-300 rounded-lg p-1 text-[11px] font-bold text-slate-800 outline-hidden"
                              >
                                <option value="insumo">Insumo / Papel</option>
                                <option value="maquina">Máquina / Clique</option>
                                <option value="mao_obra">Mão de Obra</option>
                                <option value="embalagem">Embalagem</option>
                              </select>
                            </td>

                            <td className="p-2.5">
                              <input
                                type="text"
                                value={comp.name}
                                onChange={(e) => handleComponentChange(idx, "name", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1 font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                              />
                              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                SKU: {comp.sku}
                              </span>
                            </td>

                            <td className="p-2.5 text-center">
                              <select
                                value={comp.unit}
                                onChange={(e) => handleComponentChange(idx, "unit", e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded-lg p-1 text-[11px] font-bold text-slate-800 outline-hidden uppercase"
                              >
                                <option value="FLS">FLS</option>
                                <option value="CLQ">CLQ</option>
                                <option value="MIN">MIN</option>
                                <option value="UN">UN</option>
                                <option value="M">M</option>
                                <option value="M2">M²</option>
                              </select>
                            </td>

                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                step="0.0001"
                                value={comp.quantityConsumed}
                                onChange={(e) =>
                                  handleComponentChange(idx, "quantityConsumed", e.target.value)
                                }
                                className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-mono font-extrabold text-slate-900 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                              />
                            </td>

                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                step="0.0001"
                                value={comp.unitCost}
                                onChange={(e) =>
                                  handleComponentChange(idx, "unitCost", e.target.value)
                                }
                                className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-mono font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                              />
                            </td>

                            <td className="p-2.5 text-right font-mono font-extrabold text-emerald-700">
                              R$ {totalCompCost.toFixed(4)}
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleRemoveComponent(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wide">
                    SOMA TOTAL DA COMPOSIÇÃO BASE
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    R$ {calc.baseCompositionCost.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Novo Produto</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Categoria de Produto</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  <option value="grafica_rapida">Gráfica Rápida (Cartões, Panfletos, Pastas)</option>
                  <option value="papelaria_personalizada">Papelaria Personalizada (Caixas, Festas, Agendas)</option>
                  <option value="comunicacao_visual">Comunicação Visual (Banners, Adesivos M², Placas)</option>
                  <option value="brindes">Brindes & Etiquetas Rótulos</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Modelo de Ficha Técnica Base</label>
                <select
                  value={newProdPreset}
                  onChange={(e) => setNewProdCategoryPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  <option value="cartao_visita">1. Cartão de Visita Premium (Aproveitamento 24 un/A3)</option>
                  <option value="etiqueta_5cm">2. Etiqueta Adesiva Redonda 5cm (Aproveitamento 40 un/A3)</option>
                  <option value="caixa_cone">3. Caixa Cone / Pirâmide Festas (Aproveitamento 1 un/A3)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">SKU / Código Único</label>
                <input
                  type="text"
                  placeholder="PRO-CRV-COU300VT"
                  value={newProdCode}
                  onChange={(e) => setNewProdCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartão de Visita Couchê 300g Verniz"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
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
                  Cadastrar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
