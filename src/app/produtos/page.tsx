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
  Truck,
  Zap,
  FolderPlus,
  Printer,
  Maximize2,
  Image as ImageIcon,
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
import {
  calculateBannerPricing,
  calculateStickerM2Pricing,
  BannerCalculationResult,
  StickerM2Result,
} from "@/lib/visualCommunicationPricingEngine";

interface ProductRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  salesUnit: string;
  printerId?: string;
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

interface PrinterRecord {
  id: string;
  name: string;
  brand: string;
  model: string;
  technology: string;
  categoryName?: string;
  fixedCostPerImp: string;
}

interface MaterialRecord {
  id: string;
  code: string;
  name: string;
  costPrice: string;
  consumptionUnit: string;
}

export default function ProdutosPage() {
  const [productsList, setProductsList] = useState<ProductRecord[]>([]);
  const [printersList, setPrintersList] = useState<PrinterRecord[]>([]);
  const [materialsList, setMaterialsList] = useState<MaterialRecord[]>([]);

  // Categories List
  const [categoriesList, setCategoriesList] = useState<
    Array<{ id: string; label: string }>
  >([
    { id: "grafica_rapida", label: "Gráfica" },
    { id: "papelaria_personalizada", label: "Papelaria Personalizada" },
    { id: "brindes", label: "Brindes" },
    { id: "dtf", label: "Serviços DTF" },
    { id: "comunicacao_visual", label: "Comunicação Visual" },
    { id: "estamparia", label: "Estamparia" },
  ]);

  const [activeCategoryTab, setActiveCategoryTab] = useState("grafica_rapida");
  const [dtfSubTab, setDtfSubTab] = useState<"dtf_uv" | "dtf_textil">("dtf_uv");
  const [cvSubTab, setCvSubTab] = useState<"banner" | "adesivo">("banner");

  // View state: 'grid' | 'detail' | 'dtf_calc' | 'cv_calc'
  const [viewMode, setViewMode] = useState<"grid" | "detail" | "dtf_calc" | "cv_calc">("grid");
  const [activeProduct, setActivePrinterProduct] = useState<ProductRecord | null>(null);

  // Editable composition data for standard BOM
  const [compositionData, setCompositionData] = useState<ProductCompositionData>(
    DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita
  );

  // Selected Machine for active product (can be empty / "none")
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("");

  // DTF Service Calculator State
  const [dtfType, setDtfType] = useState<"dtf_uv" | "dtf_textil">("dtf_uv");
  const [dtfFormatKey, setDtfFormatKey] = useState("metro_uv");
  const [dtfFreight, setDtfFreight] = useState("10.00");
  const [dtfMargin, setDtfMargin] = useState("40.00");

  // Comunicação Visual (m²) Calculator State
  const [cvType, setCvType] = useState<"banner" | "adesivo">("banner");
  const [bannerWidth, setBannerWidth] = useState("1.20");
  const [bannerHeight, setBannerHeight] = useState("0.90");
  const [bannerPriceM2, setBannerPriceM2] = useState("35.00");
  const [bannerMinPrice, setBannerMinPrice] = useState("26.00");
  const [bannerFreight, setBannerFreight] = useState("10.00");
  const [bannerMargin, setBannerMargin] = useState("40.00");

  const [stickerWidthCm, setStickerWidthCm] = useState("6.0");
  const [stickerHeightCm, setStickerHeightCm] = useState("6.0");
  const [stickerGapMm, setStickerGapMm] = useState("3.0");
  const [stickerPriceM2, setStickerPriceM2] = useState("40.00");
  const [stickerQty, setStickerQty] = useState("100");
  const [stickerFreight, setStickerFreight] = useState("10.00");
  const [stickerMargin, setStickerMargin] = useState("50.00");

  // Supplier Base Prices Table for DTF Formats (Editable)
  const [dtfSupplierPrices, setDtfSupplierPrices] = useState({
    a4_uv: { label: "A4 (28 × 19 cm)", cost: 49.0 },
    a3_uv: { label: "A3 (28 × 40 cm)", cost: 79.0 },
    metro_uv: { label: "Metro (28 × 100 cm)", cost: 99.0 },
    a4_textil: { label: "A4 (38 × 25 cm)", cost: 34.9 },
    a3_textil: { label: "A3 (38 × 50 cm)", cost: 54.9 },
    metro_textil: { label: "Metro (38 × 100 cm)", cost: 84.9 },
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal for new category
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Modal for new product
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("grafica_rapida");
  const [newProdPreset, setNewProdCategoryPreset] = useState("cartao_visita");

  const loadAllProducts = async () => {
    try {
      const [resProd, resPrint, resMat, resSet] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/printers"),
        fetch("/api/materials"),
        fetch("/api/settings"),
      ]);
      const dataProd = await resProd.json();
      const dataPrint = await resPrint.json();
      const dataMat = await resMat.json();
      const dataSet = await resSet.json();

      if (Array.isArray(dataProd)) setProductsList(dataProd);
      if (dataPrint.printers) setPrintersList(dataPrint.printers);
      if (Array.isArray(dataMat)) setMaterialsList(dataMat);

      if (dataSet.map) {
        const m = dataSet.map;
        if (m.cv_banner_price_m2) setBannerPriceM2(m.cv_banner_price_m2);
        if (m.cv_banner_min_price_under_1m2) setBannerMinPrice(m.cv_banner_min_price_under_1m2);
        if (m.cv_adesivo_price_m2) setStickerPriceM2(m.cv_adesivo_price_m2);

        if (m.dtf_supplier_prices) {
          try {
            const parsed = JSON.parse(m.dtf_supplier_prices);
            const mapObj: any = {};
            if (parsed.dtf_uv) {
              parsed.dtf_uv.forEach((i: any) => {
                mapObj[i.id] = { label: i.name, cost: i.cost };
              });
            }
            if (parsed.dtf_textil) {
              parsed.dtf_textil.forEach((i: any) => {
                mapObj[i.id] = { label: i.name, cost: i.cost };
              });
            }
            setDtfSupplierPrices((prev) => ({ ...prev, ...mapObj }));
          } catch {
            // fallback
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  const handleOpenDetail = (product: ProductRecord) => {
    setActivePrinterProduct(product);
    setSelectedPrinterId(product.printerId || "");
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

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${name}" do catálogo?`)) {
      try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        loadAllProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Live calculation of standard product pricing
  const calc = calculateProductPricingDetails(compositionData);

  // Selected Machine details
  const activeMachine = printersList.find((p) => p.id === selectedPrinterId);
  const activeMachineCost = activeMachine ? parseFloat(activeMachine.fixedCostPerImp || "0.00") : 0.00;

  // Live DTF Calculation (Venda Direta)
  const selectedDtfFormat = (dtfSupplierPrices as any)[dtfFormatKey] || dtfSupplierPrices.metro_uv;
  const dtfBaseCost = selectedDtfFormat.cost;
  const dtfFreightNum = parseFloat(dtfFreight || "0");
  const dtfTotalCost = dtfBaseCost + dtfFreightNum;
  const dtfMarginNum = parseFloat(dtfMargin || "0");
  const dtfDivisor = 1 - dtfMarginNum / 100;
  const dtfFinalPrice = dtfDivisor > 0.05 ? dtfTotalCost / dtfDivisor : dtfTotalCost * 2;
  const dtfProfit = dtfFinalPrice - dtfTotalCost;

  // Live Banner Calculation (< 1m2 minimum charge rule)
  const bannerCalcRes: BannerCalculationResult = calculateBannerPricing({
    widthMeters: parseFloat(bannerWidth || "1.2"),
    heightMeters: parseFloat(bannerHeight || "0.9"),
    supplierPricePerM2: parseFloat(bannerPriceM2 || "35.00"),
    minChargeUnder1M2: parseFloat(bannerMinPrice || "26.00"),
    freightCost: parseFloat(bannerFreight || "10.00"),
    targetMarginPercent: parseFloat(bannerMargin || "40.00"),
    taxPercent: 6.0,
    cardTaxPercent: 3.16,
  });

  // Live Sticker Calculation (m2 yield)
  const stickerCalcRes: StickerM2Result = calculateStickerM2Pricing({
    stickerWidthCm: parseFloat(stickerWidthCm || "6.0"),
    stickerHeightCm: parseFloat(stickerHeightCm || "6.0"),
    gapMm: parseFloat(stickerGapMm || "3.0"),
    supplierPricePerM2: parseFloat(stickerPriceM2 || "40.00"),
    quantityOrdered: parseInt(stickerQty || "100", 10),
    freightCost: parseFloat(stickerFreight || "10.00"),
    targetMarginPercent: parseFloat(stickerMargin || "50.00"),
    taxPercent: 6.0,
    cardTaxPercent: 3.16,
  });

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

  // Picker handler: when selecting a material from the registered Materials & Insumos list
  const handleSelectMaterialForComponent = (idx: number, matId: string) => {
    const selectedMat = materialsList.find((m) => m.id === matId);
    if (selectedMat) {
      const nextComponents = [...compositionData.components];
      if (nextComponents[idx]) {
        nextComponents[idx] = {
          ...nextComponents[idx],
          sku: selectedMat.code,
          name: selectedMat.name,
          unit: selectedMat.consumptionUnit || "FLS",
          unitCost: parseFloat(selectedMat.costPrice || "0"),
        };
        setCompositionData({ ...compositionData, components: nextComponents });
      }
    }
  };

  const handleAddComponent = () => {
    const newComp: ProductComponentItem = {
      id: `c_${Date.now()}`,
      category: "insumo",
      sku: "INS-NOVO",
      name: "Selecione o Insumo...",
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
          printerId: selectedPrinterId || null,
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
        loadAllProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDtfProduct = async () => {
    setSaving(true);
    try {
      const dtfCode = `DTF-${dtfType.toUpperCase()}-${Date.now().toString().slice(-5)}`;
      const dtfName = `Impressão DTF ${dtfType === "dtf_uv" ? "UV" : "Têxtil"} - ${selectedDtfFormat.label}`;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: dtfCode,
          name: dtfName,
          category: "dtf",
          salesUnit: dtfFormatKey.includes("metro") ? "M" : "UN",
          overrideSellPrice: dtfFinalPrice.toFixed(2),
          targetMarginPercent: dtfMargin,
          compositionData: {
            salesUnit: dtfFormatKey.includes("metro") ? "M" : "UN",
            yieldPerA3Sheet: 1,
            yieldFactor: 1,
            lossMarginPercent: 0,
            taxPercent: 0,
            cardTaxPercent: 0,
            targetMarginPercent: parseFloat(dtfMargin),
            components: [
              {
                id: "dtf_1",
                category: "insumo",
                sku: `INS-${dtfType.toUpperCase()}`,
                name: `Serviço Impressão ${dtfName}`,
                unit: dtfFormatKey.includes("metro") ? "M" : "UN",
                quantityConsumed: 1,
                unitCost: dtfTotalCost,
              },
            ],
          },
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setViewMode("grid");
        loadAllProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCvProduct = async () => {
    setSaving(true);
    try {
      const isBanner = cvType === "banner";
      const code = `${isBanner ? "BAN" : "ADQ"}-${Date.now().toString().slice(-5)}`;
      const name = isBanner
        ? `Banner Lona 440g ${bannerWidth}x${bannerHeight}m`
        : `${stickerQty} Adesivos Vinil ${stickerWidthCm}x${stickerHeightCm}cm (Aproveitamento m²)`;
      const price = isBanner ? bannerCalcRes.suggestedPrice : stickerCalcRes.totalBatchPrice;
      const cost = isBanner ? bannerCalcRes.totalCostWithFreight : stickerCalcRes.totalCostWithFreight;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          category: "comunicacao_visual",
          salesUnit: isBanner ? "UN" : "MILI",
          overrideSellPrice: price.toFixed(2),
          targetMarginPercent: isBanner ? bannerMargin : stickerMargin,
          compositionData: {
            salesUnit: isBanner ? "UN" : "MILI",
            yieldPerA3Sheet: 1,
            yieldFactor: 1,
            lossMarginPercent: 0,
            taxPercent: 6,
            cardTaxPercent: 3.16,
            targetMarginPercent: parseFloat(isBanner ? bannerMargin : stickerMargin),
            components: [
              {
                id: "cv_1",
                category: "insumo",
                sku: `INS-${isBanner ? "BANNER" : "STICKER"}`,
                name: `Comunicação Visual m² (${name})`,
                unit: "M2",
                quantityConsumed: 1,
                unitCost: cost,
              },
            ],
          },
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setViewMode("grid");
        loadAllProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatName.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
    setCategoriesList([...categoriesList, { id: catId, label: newCatName }]);
    setNewCatName("");
    setShowNewCategoryModal(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sample =
        newProdPreset === "vazio"
          ? DEFAULT_PRODUCT_COMPOSITIONS.vazio
          : DEFAULT_PRODUCT_COMPOSITIONS[newProdPreset] || DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newProdCode || `PROD-${Date.now().toString().slice(-6)}`,
          name: newProdName,
          category: newProdCategory,
          printerId: selectedPrinterId || null,
          compositionData: sample,
        }),
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewProdName("");
        setNewProdCode("");
        loadAllProducts();
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

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("cv_calc")}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-amber-300" />
                <span>Precificação Comunicação Visual (m²)</span>
              </button>

              <button
                onClick={() => setViewMode("dtf_calc")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Precificação Serviço DTF</span>
              </button>

              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Cadastrar Novo Produto
              </button>
            </div>
          </div>

          {/* Product Category Tabs Bar matching requested Diagram */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryTab(cat.id)}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeCategoryTab === cat.id
                      ? "bg-sky-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  [ {cat.label.toUpperCase()} ]
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="px-3 py-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
            >
              <FolderPlus className="w-3.5 h-3.5" /> + Criar Categoria
            </button>
          </div>

          {/* Render Products for Selected Category */}
          {(() => {
            const catObj = categoriesList.find((c) => c.id === activeCategoryTab) || categoriesList[0];
            const catProducts = productsList.filter((p) => {
              if (activeCategoryTab === "dtf") return p.category === "dtf";
              return p.category === activeCategoryTab;
            });

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    Categoria: {catObj.label}
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
                    const mach = printersList.find((m) => m.id === p.printerId);

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
                            {/* Selected Printer & Impression Cost */}
                            <div className="flex items-center justify-between font-bold text-[11px] text-sky-800 border-b border-slate-200 pb-1">
                              <span className="flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5 text-sky-600" />
                                {mach ? mach.name : "Nenhuma Impressora"}
                              </span>
                              <span className="font-mono">
                                {mach ? `R$ ${parseFloat(mach.fixedCostPerImp).toFixed(4)}/clq` : "—"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">Custo Base Composição:</span>
                              <span className="font-mono font-bold text-slate-800">
                                R$ {baseCost.toFixed(4)}
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
                            <span className="text-lg font-black text-emerald-400 font-mono">
                              {formatCurrency(finalPrice)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenDetail(p)}
                              className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Editar Ficha Técnica</span>
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl cursor-pointer transition-colors"
                              title="Excluir Produto do Catálogo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      ) : viewMode === "cv_calc" ? (
        /* ================= VIEW 4: COMUNICAÇÃO VISUAL (BANNERS & ADESIVOS m²) CALCULATOR ================= */
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <button
                onClick={handleBackToGrid}
                className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Catálogo de Produtos
              </button>
              <span className="text-[11px] font-extrabold uppercase text-sky-700 tracking-wider block">
                CÁLCULO DE COMUNICAÇÃO VISUAL (METRO QUADRADO m²)
              </span>
              <h1 className="text-2xl font-black text-slate-800">
                Calculadora de Banners & Adesivos Vinil (m²)
              </h1>
            </div>

            <button
              onClick={handleSaveCvProduct}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "SALVAR PRODUTO EM m²"}</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6 text-xs text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-xs block border-b border-slate-200 pb-2">
                  1. DIMENSÕES E REGRA DO BANNER
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Largura (Metros)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bannerWidth}
                      onChange={(e) => setBannerWidth(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold font-mono text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Altura (Metros)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bannerHeight}
                      onChange={(e) => setBannerHeight(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold font-mono text-slate-800 outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                  <span className="font-bold block">Área do Banner: {bannerCalcRes.areaM2} m²</span>
                  {bannerCalcRes.isUnder1M2 ? (
                    <p className="text-amber-800 font-semibold">
                      ⚠️ Área menor que 1,0m²! Aplicando regra da trava de custo mínimo fixo: <strong>R$ {bannerMinPrice}</strong>.
                    </p>
                  ) : (
                    <p className="text-emerald-800 font-semibold">
                      ✓ Área &ge; 1,0m²! Multiplicando área pela tabela do fornecedor (R$ {bannerPriceM2}/m²).
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-xs block border-b border-slate-200 pb-2">
                  2. CUSTO E MARGEM
                </span>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frete de Chegada (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bannerFreight}
                    onChange={(e) => setBannerFreight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Margem de Lucro (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bannerMargin}
                    onChange={(e) => setBannerMargin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-emerald-700 outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">CUSTO TOTAL (Lona+Frete)</span>
                <div className="text-xl font-black text-slate-800 font-mono">
                  {formatCurrency(bannerCalcRes.totalCostWithFreight)}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">LUCRO REAL (R$)</span>
                <div className="text-xl font-black text-emerald-600 font-mono">
                  {formatCurrency(bannerCalcRes.profitAmount)}
                </div>
              </div>

              <div className="p-4 bg-sky-600 text-white rounded-2xl text-center space-y-1 shadow-md">
                <span className="text-[10px] font-extrabold text-sky-200 uppercase block">PREÇO FINAL DO BANNER</span>
                <div className="text-2xl font-black text-white font-mono">
                  {formatCurrency(bannerCalcRes.suggestedPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === "dtf_calc" ? (
        /* ================= VIEW 3: DYNAMIC DTF PRICING CALCULATOR ================= */
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <button
                onClick={handleBackToGrid}
                className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Catálogo de Produtos
              </button>
              <span className="text-[11px] font-extrabold uppercase text-purple-700 tracking-wider block">
                CÁLCULO E PRECIFICAÇÃO DE SERVIÇOS DTF (UV & TÊXTIL)
              </span>
              <h1 className="text-2xl font-black text-slate-800">
                Calculadora de Impressão DTF
              </h1>
            </div>

            <button
              onClick={handleSaveDtfProduct}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "SALVAR PRODUTO DTF"}</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6 text-xs text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-xs block border-b border-slate-200 pb-2">
                  1. OPÇÃO DE DTF
                </span>

                <div>
                  <label className="font-bold text-slate-700 block mb-2">Tipo de Impressão:</label>
                  <div className="flex gap-4 font-bold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dtfType"
                        checked={dtfType === "dtf_uv"}
                        onChange={() => {
                          setDtfType("dtf_uv");
                          setDtfFormatKey("metro_uv");
                        }}
                        className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>(•) DTF UV</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dtfType"
                        checked={dtfType === "dtf_textil"}
                        onChange={() => {
                          setDtfType("dtf_textil");
                          setDtfFormatKey("metro_textil");
                        }}
                        className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>( ) DTF Têxtil</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Formato / Tamanho:</label>
                  <select
                    value={dtfFormatKey}
                    onChange={(e) => setDtfFormatKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    {dtfType === "dtf_uv" ? (
                      <>
                        <option value="metro_uv">Metro (28 × 100 cm) — R$ 99,00</option>
                        <option value="a3_uv">A3 (28 × 40 cm) — R$ 79,00</option>
                        <option value="a4_uv">A4 (28 × 19 cm) — R$ 49,00</option>
                      </>
                    ) : (
                      <>
                        <option value="metro_textil">Metro (38 × 100 cm) — R$ 84,90</option>
                        <option value="a3_textil">A3 (38 × 50 cm) — R$ 54,90</option>
                        <option value="a4_textil">A4 (38 × 25 cm) — R$ 34,90</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-600">Custo Base (Empresa DTF):</span>
                  <span className="text-base font-black text-purple-700 font-mono">
                    {formatCurrency(dtfBaseCost)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-xs block border-b border-slate-200 pb-2">
                  2. CUSTO DE ENTREGA E MARGEM
                </span>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frete de Chegada (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dtfFreight}
                    onChange={(e) => setDtfFreight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Margem de Lucro (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dtfMargin}
                    onChange={(e) => setDtfMargin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-emerald-700 outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-3">
              <span className="font-extrabold text-slate-900 uppercase text-xs block">
                3. RESUMO DA PRECIFICAÇÃO DTF (VENDA DIRETA DO SERVIÇO)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">CUSTO TOTAL (DTF+Frete)</span>
                  <div className="text-xl font-black text-slate-800 font-mono">
                    {formatCurrency(dtfTotalCost)}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">LUCRO REAL (R$)</span>
                  <div className="text-xl font-black text-emerald-600 font-mono">
                    {formatCurrency(dtfProfit)}
                  </div>
                </div>

                <div className="p-4 bg-sky-600 text-white rounded-2xl text-center space-y-1 shadow-md">
                  <span className="text-[10px] font-extrabold text-sky-200 uppercase block">PREÇO FINAL DE VENDA</span>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatCurrency(dtfFinalPrice)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VIEW 2: FULL PAGE REAL-TIME BOM & PRICING EDITOR ================= */
        <div className="space-y-5">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column */}
            <div className="space-y-4">
              {/* MACHINE SELECTION (With option "Nenhuma Impressora") */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-sky-600" /> Impressora / Máquina Vinculada
                  </span>
                  <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {selectedPrinterId ? `R$ ${activeMachineCost.toFixed(4)} / imp` : "Sem Máquina"}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selecione a Impressora</label>
                  <select
                    value={selectedPrinterId}
                    onChange={(e) => setSelectedPrinterId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Nenhuma / Não Utiliza Impressora (Custo R$ 0,00)</option>
                    {printersList.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name} ({pr.categoryName}) — R$ {parseFloat(pr.fixedCostPerImp).toFixed(4)}/imp
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Yield Matrix Presets */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-600" /> Matriz de Aproveitamento
                  </span>
                  <span className="bg-sky-100 text-sky-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                    Unidade: {compositionData.salesUnit || "UN"}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Formato / Aproveitamento por Folha</label>
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
                      <option key={m.label} value={m.yieldPerSheet}>
                        {m.label}
                      </option>
                    ))}
                  </select>
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden"
                    />
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden"
                    />
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800 outline-hidden"
                    />
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-emerald-700 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Dark Calculation Summary Panel */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    CUSTO BASE DA COMPOSIÇÃO (BOM)
                  </span>
                  <div className="text-lg font-black text-slate-200 font-mono">
                    R$ {calc.baseCompositionCost.toFixed(4)}
                  </div>
                </div>

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
              </div>
            </div>

            {/* Right Column: Editable Ficha Técnica BOM with Material Picker */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Ficha Técnica Unificada (BOM) — Composição do Produto
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
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
                        <th className="p-2.5">SELECIONAR DO ESTOQUE DE MATERIAIS / COMPONENTE</th>
                        <th className="p-2.5 text-center">UNIDADE</th>
                        <th className="p-2.5 text-center">QTD. CONSUMIDA (4 DEC)</th>
                        <th className="p-2.5 text-right">CUSTO UN (R$)</th>
                        <th className="p-2.5 text-right">CUSTO COMPOSIÇÃO</th>
                        <th className="p-2.5 text-center">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {compositionData.components.map((comp, idx) => {
                        const totalCompCost = comp.category === "nenhum" ? 0 : comp.quantityConsumed * comp.unitCost;

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
                                <option value="nenhum">Nenhum / Não Usar</option>
                              </select>
                            </td>

                            <td className="p-2.5 space-y-1">
                              {/* Search / Selector from Registered Materials */}
                              {comp.category === "insumo" && materialsList.length > 0 && (
                                <select
                                  onChange={(e) => handleSelectMaterialForComponent(idx, e.target.value)}
                                  className="w-full bg-sky-50 border border-sky-300 rounded-lg p-1 text-[11px] font-bold text-sky-900 outline-hidden mb-1"
                                >
                                  <option value="">+ Selecionar dos Materiais e Insumos...</option>
                                  {materialsList.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} ({m.code}) — R$ {parseFloat(m.costPrice).toFixed(4)}/{m.consumptionUnit}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <input
                                type="text"
                                value={comp.name}
                                onChange={(e) => handleComponentChange(idx, "name", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1 font-bold text-slate-800 outline-hidden"
                              />
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
                                disabled={comp.category === "nenhum"}
                                value={comp.quantityConsumed}
                                onChange={(e) =>
                                  handleComponentChange(idx, "quantityConsumed", e.target.value)
                                }
                                className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-center font-mono font-extrabold text-slate-900 outline-hidden disabled:opacity-50"
                              />
                            </td>

                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                step="0.0001"
                                disabled={comp.category === "nenhum"}
                                value={comp.unitCost}
                                onChange={(e) =>
                                  handleComponentChange(idx, "unitCost", e.target.value)
                                }
                                className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1 text-right font-mono font-bold text-slate-800 outline-hidden disabled:opacity-50"
                              />
                            </td>

                            <td className="p-2.5 text-right font-mono font-extrabold text-emerald-700">
                              R$ {totalCompCost.toFixed(4)}
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleRemoveComponent(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
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

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 space-y-3">
            <h3 className="text-base font-bold text-slate-800">Criar Nova Categoria de Produto</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rótulos & Adesivos Especiais"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
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
                <label className="font-semibold text-slate-700 block mb-1">Categoria do Produto</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Modelo de Ficha Técnica Base</label>
                <select
                  value={newProdPreset}
                  onChange={(e) => setNewProdCategoryPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  <option value="vazio">Nenhum Modelo (Ficha Técnica Vazia / Sem Componentes)</option>
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
                  placeholder="Ex: Camiseta Personalizada DTF Têxtil A4"
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
