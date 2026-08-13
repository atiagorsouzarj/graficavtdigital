"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle,
  Search,
  Calculator,
  Layers,
  Tag,
  Boxes,
  FileText,
  DollarSign,
  Info,
  Check,
  MessageSquare,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MaterialItem {
  id: string;
  code: string;
  name: string;
  itemType: string; // 'insumo', 'embalagem', 'produto_acabado', 'revenda'
  category: string; // 'paper', 'banner_lona', 'vinil', 'ink', 'gift', 'box'
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: string;
  stockQuantity: string;
  minStockQuantity: string;
  purchasePrice: string;
  costPrice: string;
  ncm?: string;
  grammage?: string;
  dimensions?: string;
  finishType?: string;
  supplier?: string;
  supplierPhone?: string;
}

export default function MateriaisPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [itemType, setItemType] = useState("insumo");
  const [category, setCategory] = useState("paper");
  const [purchaseUnit, setPurchaseUnit] = useState("PCT");
  const [consumptionUnit, setConsumptionUnit] = useState("FLS");
  const [conversionFactor, setConversionFactor] = useState("100");
  const [stockQuantity, setStockQuantity] = useState("1000");
  const [minStockQuantity, setMinStockQuantity] = useState("200");
  const [purchasePrice, setPurchasePrice] = useState("85.00");
  const [ncm, setNcm] = useState("4802.57.99");
  const [grammage, setGrammage] = useState("180g");
  const [dimensions, setDimensions] = useState("A4 (210x297mm)");
  const [finishType, setFinishType] = useState("Branco Fosco");
  const [supplier, setSupplier] = useState("Suzano Papéis");

  // m2 Paper Sheet Calculator State
  const [sheetWidthCm, setSheetWidthCm] = useState("66");
  const [sheetHeightCm, setSheetHeightCm] = useState("96");
  const [sheetPriceBrl, setSheetPriceBrl] = useState("1.85");

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (Array.isArray(data)) setMaterials(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // m2 calculation
  const sheetAreaM2 = (parseFloat(sheetWidthCm || "66") * parseFloat(sheetHeightCm || "96")) / 10000;
  const costPerM2 = sheetAreaM2 > 0 ? parseFloat(sheetPriceBrl || "1.85") / sheetAreaM2 : 0;

  const handleRequestSupplierQuote = (m: MaterialItem) => {
    const text = `Olá ${m.supplier || "Fornecedor"}! Gostaria de solicitar cotação para reposição do insumo *${m.name}* (Código ${m.code}).\n\nEstoque Atual: ${m.stockQuantity} ${m.consumptionUnit}\nQuantidade que precisamos cotar: 500 ${m.consumptionUnit}.`;
    const waPhone = m.supplierPhone || "5521978869414";
    window.open(`https://wa.me/${waPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      (m.supplier || "").toLowerCase().includes(search.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "papeis") return matchesSearch && (m.category === "paper" || m.consumptionUnit === "FLS");
    if (activeTab === "lonas_vinis") return matchesSearch && (m.category === "banner_lona" || m.category === "vinil" || m.consumptionUnit === "M2");
    if (activeTab === "tintas") return matchesSearch && (m.category === "ink" || m.consumptionUnit === "ML" || m.consumptionUnit === "CLQ");
    if (activeTab === "embalagens") return matchesSearch && (m.itemType === "embalagem" || m.consumptionUnit === "CX" || m.consumptionUnit === "UN");
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              ESTOQUE & COMPOSIÇÃO DE PRODUTOS
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Materiais, Insumos & Papéis</h1>
            <p className="text-xs text-slate-500">
              Controle de consumo unitário por folha/m², conversão de unidades de compra e cotações de fornecedores.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Novo Material / Insumo
          </button>
        </div>

        {/* m2 Paper Sheet Calculator Card */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-xs text-sky-400 flex items-center gap-1.5 uppercase">
              <Maximize2 className="w-4 h-4" /> CALCULADORA RÁPIDA DE CUSTO POR m² DE FOLHAS E BOBINAS
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
              Custo por m²: {formatCurrency(costPerM2)}/m²
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">
                Largura da Folha (cm):
              </label>
              <input
                type="number"
                value={sheetWidthCm}
                onChange={(e) => setSheetWidthCm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 font-bold text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">
                Altura da Folha (cm):
              </label>
              <input
                type="number"
                value={sheetHeightCm}
                onChange={(e) => setSheetHeightCm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 font-bold text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">
                Preço por Folha Inteira (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={sheetPriceBrl}
                onChange={(e) => setSheetPriceBrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 font-mono font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "Todos os Insumos" },
              { id: "papeis", label: "Papéis & Cartões" },
              { id: "lonas_vinis", label: "Lonas & Vinis (m²)" },
              { id: "tintas", label: "Tintas, Toners & Ribbons" },
              { id: "embalagens", label: "Embalagens & Caixas" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar insumo ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium"
            />
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Descrição do Insumo / Papel</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Conversão Compra/Consumo</th>
                  <th className="p-3 text-right">Custo Unitário</th>
                  <th className="p-3 text-center">Estoque Atual</th>
                  <th className="p-3 text-center">Ação WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((m) => {
                  const stockNum = parseFloat(m.stockQuantity || "0");
                  const minStockNum = parseFloat(m.minStockQuantity || "0");
                  const isLowStock = stockNum <= minStockNum;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-700">{m.code}</td>
                      <td className="p-3 font-bold text-slate-800">
                        <div>{m.name}</div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {m.grammage || ""} {m.dimensions || ""}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-semibold">{m.supplier || "Suzano Papéis"}</td>
                      <td className="p-3 text-slate-500">
                        1 {m.purchaseUnit || "PCT"} = {m.conversionFactor || "100"} {m.consumptionUnit || "FLS"}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(m.costPrice)} / {m.consumptionUnit || "FLS"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            isLowStock ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {m.stockQuantity} {m.consumptionUnit || "FLS"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRequestSupplierQuote(m)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          title="Pedir Cotação no WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cotar Reposição</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
