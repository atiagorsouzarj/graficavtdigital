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
  ShieldAlert,
  ArrowRight,
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

  // Main Mode: 'grid' (BOM Products) | 'dtf_calc' (DTF Services) | 'cv_calc' (Banner & Sticker m²) | 'detail' (Product BOM Editor)
  const [viewMode, setViewMode] = useState<"grid" | "detail" | "dtf_calc" | "cv_calc">("grid");
  const [activeProduct, setActivePrinterProduct] = useState<ProductRecord | null>(null);

  // Editable composition data for standard BOM
  const [compositionData, setCompositionData] = useState<ProductCompositionData>(
    DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita
  );

  // Selected Machine for active product
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("");

  // DTF Service Calculator State
  const [dtfType, setDtfType] = useState<"dtf_uv" | "dtf_textil">("dtf_uv");
  const [dtfFormatKey, setDtfFormatKey] = useState("metro_uv");
  const [dtfFreight, setDtfFreight] = useState("10.00");
  const [dtfMargin, setDtfMargin] = useState("40.00");

  // DTF Supplier Prices
  const [dtfSupplierPrices, setDtfSupplierPrices] = useState({
    a4_uv: { label: "A4 (28 × 19 cm)", cost: 49.0 },
    a3_uv: { label: "A3 (28 × 40 cm)", cost: 79.0 },
    metro_uv: { label: "Metro (28 × 100 cm)", cost: 99.0 },
    a4_textil: { label: "A4 (38 × 25 cm)", cost: 34.9 },
    a3_textil: { label: "A3 (38 × 50 cm)", cost: 54.9 },
    metro_textil: { label: "Metro (38 × 100 cm)", cost: 84.9 },
  });

  // Visual Communication (Banner / Sticker) Calculator State
  const [cvType, setCvType] = useState<"banner" | "sticker">("banner");
  const [bannerWidth, setBannerWidth] = useState("1.20");
  const [bannerHeight, setBannerHeight] = useState("0.90");
  const [bannerPriceM2, setBannerPriceM2] = useState("35.00");
  const [bannerMinPrice, setBannerMinPrice] = useState("26.00");
  const [bannerFreight, setBannerFreight] = useState("10.00");
  const [bannerMargin, setBannerMargin] = useState("40.00");

  // Sticker State
  const [stickerWidthCm, setStickerWidthCm] = useState("6.0");
  const [stickerHeightCm, setStickerHeightCm] = useState("6.0");
  const [stickerGapMm, setStickerGapMm] = useState("3.0");
  const [stickerPriceM2, setStickerPriceM2] = useState("40.00");
  const [stickerQty, setStickerQty] = useState("100");
  const [stickerFreight, setStickerFreight] = useState("10.00");
  const [stickerMargin, setStickerMargin] = useState("50.00");

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newProdName, setNewProdName] = useState("");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("grafica_rapida");
  const [newProdPreset, setNewProdPreset] = useState("cartao_visita");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Products, Printers and Materials from API
  const loadAllProducts = async () => {
    try {
      const [prodsRes, printersRes, matRes, settingsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/printers"),
        fetch("/api/materials"),
        fetch("/api/settings"),
      ]);

      const prodsData = await prodsRes.json();
      const printersData = await printersRes.json();
      const matData = await matRes.json();
      const settingsData = await settingsRes.json();

      if (Array.isArray(prodsData)) setProductsList(prodsData);
      if (Array.isArray(printersData)) setPrintersList(printersData);
      if (Array.isArray(matData)) setMaterialsList(matData);

      if (settingsData.map) {
        const m = settingsData.map;
        if (m.cv_banner_price_m2) setBannerPriceM2(m.cv_banner_price_m2);
        if (m.cv_banner_min_price_under_1m2) setBannerMinPrice(m.cv_banner_min_price_under_1m2);
        if (m.cv_adesivo_price_m2) setStickerPriceM2(m.cv_adesivo_price_m2);

        if (m.dtf_supplier_prices) {
          try {
            const parsed = JSON.parse(m.dtf_supplier_prices);
            const mapObj: any = {};
            if (Array.isArray(parsed.dtf_uv)) {
              parsed.dtf_uv.forEach((item: any) => {
                mapObj[item.id] = { label: item.name, cost: item.cost };
              });
            }
            if (Array.isArray(parsed.dtf_textil)) {
              parsed.dtf_textil.forEach((item: any) => {
                mapObj[item.id] = { label: item.name, cost: item.cost };
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

  // Live DTF Calculation
  const selectedDtfFormat = (dtfSupplierPrices as any)[dtfFormatKey] || dtfSupplierPrices.metro_uv;
  const dtfBaseCost = selectedDtfFormat.cost;
  const dtfFreightNum = parseFloat(dtfFreight || "0");
  const dtfTotalCost = dtfBaseCost + dtfFreightNum;
  const dtfMarginNum = parseFloat(dtfMargin || "0");
  const dtfDivisor = 1 - dtfMarginNum / 100;
  const dtfFinalPrice = dtfDivisor > 0.05 ? dtfTotalCost / dtfDivisor : dtfTotalCost * 2;
  const dtfProfit = dtfFinalPrice - dtfTotalCost;

  // Live Banner Calculation
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

  // Live Sticker Calculation
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

  // Pure Margin vs Complete Price Simulator Values
  const pureMarginPrice = calc.costWithLoss / (1 - compositionData.targetMarginPercent / 100);

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
      
      {/* TOP 3 MAIN MODES SWITCHER BAR */}
      <div className="bg-slate-900 text-white p-2 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold mb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === "grid" || viewMode === "detail"
                ? "bg-sky-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Boxes className="w-4 h-4 text-sky-300" />
            <span>1. Produtos Tradicionais & Papelaria (BOM)</span>
          </button>

          <button
            onClick={() => setViewMode("dtf_calc")}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === "dtf_calc"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>2. Serviços DTF (UV & Têxtil)</span>
          </button>

          <button
            onClick={() => setViewMode("cv_calc")}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === "cv_calc"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Maximize2 className="w-4 h-4 text-amber-300" />
            <span>3. Comunicação Visual (Banners & Adesivos m²)</span>
          </button>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-white text-slate-950 hover:bg-sky-50 font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-600" />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {viewMode === "grid" ? (
        /* ================= VIEW 1: CATEGORIES & PRODUCTS GRID ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
                CATÁLOGO DE PRODUTOS
              </span>
              <h1 className="text-2xl font-bold text-slate-800">Produtos & Fichas Técnicas (BOM)</h1>
              <p className="text-xs text-slate-500">
                Aprovação de custos de materiais + clique de máquinas + margem de erro + impostos e taxa de cartão.
              </p>
            </div>
          </div>

          {/* Product Category Tabs Bar */}
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
                            <div className="flex items-center justify-between font-bold text-[11px] text-sky-800 border-b border-slate-200 pb-1">
                              <span className="flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5 text-sky-600" />
                                {mach ? mach.name : "Nenhuma Impressora"}
                              </span>
                              <span className="font-mono">
                                {mach ? `R$ ${parseFloat(mach.fixedCostPerImp).toFixed(4)}/clq` : "—"}
                              </span>
                            </div>

                            <div className="flex justify-between text-slate-500">
                              <span>Custo Base Insumos:</span>
                              <span className="font-mono font-bold text-slate-800">{formatCurrency(baseCost)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Perda Conservadora:</span>
                              <span className="font-mono text-slate-700">{p.lossMarginPercent || "5"}%</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Margem Alvo Bruta:</span>
                              <span className="font-mono text-emerald-600 font-bold">{p.targetMarginPercent || "60"}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">PREÇO SUGERIDO</span>
                            <span className="text-base font-black text-sky-700 font-mono">
                              {formatCurrency(finalPrice)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenDetail(p)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" /> Editar BOM
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Excluir produto"
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
      ) : viewMode === "detail" && activeProduct ? (
        /* ================= VIEW 2: PRODUCT BOM COMPOSITION & MARGIN COMPARATOR ================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToGrid}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <div>
                <span className="font-mono text-xs font-bold text-sky-700">{activeProduct.code}</span>
                <h1 className="text-xl font-extrabold text-slate-900">{activeProduct.name}</h1>
              </div>
            </div>

            <button
              onClick={handleSaveProduct}
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Ficha Técnica"}
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Ficha Técnica e Precificação atualizadas e salvas no banco de dados!</span>
            </div>
          )}

          {/* MARGIN COMPARATOR (Margem Pura vs Margem Completa com Impostos) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sky-900 text-xs uppercase flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-sky-600" /> Preço com Margem Pura ({compositionData.targetMarginPercent}%)
                </span>
                <span className="bg-sky-200 text-sky-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Sem Deducão de Imposto
                </span>
              </div>
              <p className="text-2xl font-black text-sky-900 font-mono">
                {formatCurrency(pureMarginPrice)}
              </p>
              <p className="text-[11px] text-sky-800 font-medium">
                Fórmula: <code className="font-mono">Custo / (1 - Margem)</code> • Lucro Bruto: {formatCurrency(pureMarginPrice - calc.costWithLoss)}
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-900 text-xs uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Preço Sugerido Completo (Com Imposto 6% + Cartão 3,16%)
                </span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Recomendado
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-900 font-mono">
                {formatCurrency(calc.suggestedPrice)}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                Garante o Lucro Líquido exato de {compositionData.targetMarginPercent}% mesmo após pagar impostos e taxas.
              </p>
            </div>
          </div>

          {/* BOM Components Table */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-600" /> Composição de Insumos & Cliques
              </h3>

              <button
                type="button"
                onClick={handleAddComponent}
                className="px-3.5 py-1.5 bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-sky-700 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> + Adicionar Componente
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {compositionData.components.map((comp, idx) => (
                <div
                  key={comp.id || idx}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="text-[9px] text-slate-400 font-bold block">Insumo Cadastrado</label>
                    <select
                      onChange={(e) => handleSelectMaterialForComponent(idx, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 text-xs"
                    >
                      <option value="">-- Escolha um Material --</option>
                      {materialsList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.code}) — {formatCurrency(m.costPrice)}/{m.consumptionUnit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[9px] text-slate-400 font-bold block">Nome do Componente</label>
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => handleComponentChange(idx, "name", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold block">Qtd Consumida</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={comp.quantityConsumed}
                      onChange={(e) => handleComponentChange(idx, "quantityConsumed", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold block">Custo Un (R$)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={comp.unitCost}
                      onChange={(e) => handleComponentChange(idx, "unitCost", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : viewMode === "dtf_calc" ? (
        /* ================= VIEW 3: DTF SERVICES CALCULATOR ================= */
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">
                CALCULADORA DE SERVIÇOS DTF
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Precificação de Impressão DTF (UV & Têxtil)
              </h2>
            </div>
            <button
              onClick={handleSaveDtfProduct}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Salvar no Catálogo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tecnologia DTF:</label>
              <select
                value={dtfType}
                onChange={(e: any) => {
                  setDtfType(e.target.value);
                  setDtfFormatKey(e.target.value === "dtf_uv" ? "metro_uv" : "metro_textil");
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
              >
                <option value="dtf_uv">DTF UV (Rígidos/Canecas/Brindes)</option>
                <option value="dtf_textil">DTF Têxtil (Camisetas/Tecidos)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tamanho / Formato Fornecedor:</label>
              <select
                value={dtfFormatKey}
                onChange={(e) => setDtfFormatKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
              >
                {dtfType === "dtf_uv" ? (
                  <>
                    <option value="a4_uv">A4 (28 × 19 cm) — Custo R$ {dtfSupplierPrices.a4_uv.cost.toFixed(2)}</option>
                    <option value="a3_uv">A3 (28 × 40 cm) — Custo R$ {dtfSupplierPrices.a3_uv.cost.toFixed(2)}</option>
                    <option value="metro_uv">Metro (28 × 100 cm) — Custo R$ {dtfSupplierPrices.metro_uv.cost.toFixed(2)}</option>
                  </>
                ) : (
                  <>
                    <option value="a4_textil">A4 (38 × 25 cm) — Custo R$ {dtfSupplierPrices.a4_textil.cost.toFixed(2)}</option>
                    <option value="a3_textil">A3 (38 × 50 cm) — Custo R$ {dtfSupplierPrices.a3_textil.cost.toFixed(2)}</option>
                    <option value="metro_textil">Metro (38 × 100 cm) — Custo R$ {dtfSupplierPrices.metro_textil.cost.toFixed(2)}</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-900 font-bold block uppercase">PREÇO SUGERIDO DE VENDA DTF</span>
              <span className="text-3xl font-black text-purple-950 font-mono">{formatCurrency(dtfFinalPrice)}</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-purple-800 font-bold block">Lucro Bruto: {formatCurrency(dtfProfit)}</span>
              <span className="text-purple-600 font-medium text-[10px]">Custo Total: {formatCurrency(dtfTotalCost)}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VIEW 4: VISUAL COMMUNICATION CALCULATOR (BANNERS & ADESIVOS M2) ================= */
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                CALCULADORA DE COMUNICAÇÃO VISUAL
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-emerald-600" />
                Precificação de Banners & Adesivos por m²
              </h2>
            </div>
            <button
              onClick={handleSaveCvProduct}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Salvar no Catálogo
            </button>
          </div>

          {/* Banner Min Charge Notice Badge */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Regra de Trava Mínima: Banners menores que 1,0 m² utilizam o Custo Mínimo Fixo de R$ {bannerMinPrice} do fornecedor para proteger a margem de lucro da gráfica!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Largura (Metros):</label>
              <input
                type="number"
                step="0.01"
                value={bannerWidth}
                onChange={(e) => setBannerWidth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Altura (Metros):</label>
              <input
                type="number"
                step="0.01"
                value={bannerHeight}
                onChange={(e) => setBannerHeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-900 font-bold block uppercase">PREÇO SUGERIDO BANNER LONA</span>
              <span className="text-3xl font-black text-emerald-950 font-mono">
                {formatCurrency(bannerCalcRes.suggestedPrice)}
              </span>
            </div>
            <div className="text-right text-xs">
              <span className="text-emerald-800 font-bold block">Área Total: {bannerCalcRes.areaM2.toFixed(2)} m²</span>
              <span className="text-emerald-600 font-medium text-[10px]">Custo Base: {formatCurrency(bannerCalcRes.totalCostWithFreight)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal New Category */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Nova Categoria de Produto</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Ex: Cartões de Visita Premium"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal New Product */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Cadastrar Novo Produto</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Folder A5 Couchê 150g"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white font-black rounded-xl shadow-md"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </MainLayout>
  );
}
