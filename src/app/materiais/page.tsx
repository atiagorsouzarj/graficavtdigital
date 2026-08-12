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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MaterialItem {
  id: string;
  code: string;
  name: string;
  itemType: string; // 'insumo', 'embalagem', 'produto_acabado', 'revenda'
  category: string;
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
}

export default function MateriaisPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all"); // 'all', 'insumo', 'produto_acabado', 'embalagem'
  const [showModal, setShowModal] = useState(false);

  // Form State
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

  // Computed Unit Cost
  const numPurchase = parseFloat(purchasePrice || "0");
  const numFactor = Math.max(1, parseFloat(conversionFactor || "1"));
  const autoCalculatedUnitCost = (numPurchase / numFactor).toFixed(4);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code || `INS-${Date.now().toString().slice(-6)}`,
        name,
        itemType,
        category,
        purchaseUnit,
        consumptionUnit,
        conversionFactor: numFactor,
        stockQuantity,
        minStockQuantity,
        purchasePrice: numPurchase.toFixed(2),
        ncm,
        grammage,
        dimensions,
        finishType,
        supplier,
      }),
    });
    setShowModal(false);
    fetchMaterials();
  };

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" || m.itemType === activeTab || (activeTab === "embalagem" && m.itemType === "embalagem");
    return matchesSearch && matchesTab;
  });

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Top Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              GESTÃO DE ESTOQUE & INSUMOS DE PRODUÇÃO
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Materiais, Insumos e Produtos Acabados</h1>
            <p className="text-xs text-slate-500">
              Controle fracionado de estoque (conversão de pacotes para folhas/metros), custos unitários automáticos e atributos técnicos.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Material / Insumo
          </button>
        </div>

        {/* Tab Filters */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 text-xs font-semibold">
          {[
            { id: "all", label: "Todos os Itens" },
            { id: "insumo", label: "1. Insumos de Produção (Papéis, Bobinas, Plásticos)" },
            { id: "produto_acabado", label: "2. Produtos Acabados (Sua Própria Produção)" },
            { id: "embalagem", label: "3. Embalagens & Revenda" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === t.id
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do material ou código SKU..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Structured Materials Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">[ DADOS BÁSICOS ] Item / SKU</th>
                  <th className="p-3">[ TIPO ]</th>
                  <th className="p-3 text-center">[ CONVERSÃO ] Compra ➔ Consumo</th>
                  <th className="p-3 text-right">[ CUSTOS ] Pacote / Unidade</th>
                  <th className="p-3 text-center">[ ATRIBUTOS ] Gram. / Formato</th>
                  <th className="p-3 text-right">Estoque Atual</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => {
                  const stockNum = parseFloat(m.stockQuantity || "0");
                  const minNum = parseFloat(m.minStockQuantity || "100");
                  const isLow = stockNum < minNum;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        <div>{m.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-200">
                            SKU: {m.code}
                          </span>
                          {m.ncm && (
                            <span className="text-[10px] text-slate-400 font-mono">NCM: {m.ncm}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            m.itemType === "insumo"
                              ? "bg-purple-100 text-purple-800"
                              : m.itemType === "produto_acabado"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {m.itemType.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="font-bold text-slate-700 block text-xs">
                          1 {m.purchaseUnit} = {m.conversionFactor} {m.consumptionUnit}
                        </span>
                        <span className="text-[10px] text-slate-400">Consumo em {m.consumptionUnit}</span>
                      </td>

                      <td className="p-3 text-right">
                        <span className="font-semibold text-slate-500 block text-[11px]">
                          {formatCurrency(m.purchasePrice)} / {m.purchaseUnit}
                        </span>
                        <span className="font-black text-emerald-600 text-xs block">
                          R$ {parseFloat(m.costPrice).toFixed(4)} / {m.consumptionUnit}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="text-slate-800 font-semibold block">{m.grammage || "—"}</span>
                        <span className="text-[10px] text-slate-500 block">{m.dimensions || "—"}</span>
                        {m.finishType && (
                          <span className="text-[9px] text-slate-400 block italic">{m.finishType}</span>
                        )}
                      </td>

                      <td className="p-3 text-right font-bold text-slate-800">
                        {stockNum.toLocaleString("pt-BR")} {m.consumptionUnit}
                      </td>

                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Reposição
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Structured Registration Modal with 4 Blocks */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Cadastrar Material / Insumo de Produção</h3>
                  <p className="text-xs text-slate-500">
                    Siga a estrutura dos 4 blocos para automação de estoque e custos fracionados.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* BLOCK 1: DADOS BÁSICOS */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-extrabold text-sky-700 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" /> [ 1. DADOS BÁSICOS ]
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Nome Comercial do Item</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Papel Offset 180g A4"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">SKU / Código Interno</label>
                    <input
                      type="text"
                      placeholder="INS-PAP-OFF180A4"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Item</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-bold"
                    >
                      <option value="insumo">Insumo de Produção (Papéis, Bobinas, Tintas)</option>
                      <option value="produto_acabado">Produto Acabado (Sua Própria Produção)</option>
                      <option value="embalagem">Embalagem / Sacola / Caixas</option>
                      <option value="revenda">Produto de Revenda</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Categoria de Material</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden"
                    >
                      <option value="paper">Papéis e Cartões</option>
                      <option value="vinyl">Bobinas e Vinis Adesivos</option>
                      <option value="packaging">Embalagens e Sacolas</option>
                      <option value="finished">Produtos Prontos Fabricados</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: UNIDADES E ESTOQUE */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-extrabold text-purple-700 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" /> [ 2. UNIDADES E ESTOQUE ]
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unidade de Compra</label>
                    <select
                      value={purchaseUnit}
                      onChange={(e) => setPurchaseUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden"
                    >
                      <option value="PCT">PCT (Pacote)</option>
                      <option value="RSM">RSM (Resma)</option>
                      <option value="ROLO">ROLO (Bobina)</option>
                      <option value="CX">CX (Caixa)</option>
                      <option value="UN">UN (Unidade)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unidade de Consumo</label>
                    <select
                      value={consumptionUnit}
                      onChange={(e) => setConsumptionUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden"
                    >
                      <option value="FLS">FLS (Folhas)</option>
                      <option value="M">M (Metro Linear)</option>
                      <option value="M2">M² (Metro Quadrado)</option>
                      <option value="UN">UN (Unidades)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Fator de Conversão</label>
                    <input
                      type="number"
                      value={conversionFactor}
                      onChange={(e) => setConversionFactor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-bold text-center"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      1 {purchaseUnit} = {conversionFactor} {consumptionUnit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Estoque Atual ({consumptionUnit})</label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Estoque Mínimo ({consumptionUnit})</label>
                    <input
                      type="number"
                      value={minStockQuantity}
                      onChange={(e) => setMinStockQuantity(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 3: CUSTOS E TRIBUTOS */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-extrabold text-emerald-700 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> [ 3. CUSTOS E TRIBUTOS ]
                </span>

                <div className="grid grid-cols-3 gap-2.5 items-center">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Preço de Compra ({purchaseUnit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-bold text-slate-800"
                    />
                  </div>

                  {/* Auto-Calculated Unit Cost Highlight */}
                  <div className="p-2.5 bg-emerald-100/80 rounded-xl border border-emerald-300 text-center">
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                      Custo Unitário Calculado
                    </span>
                    <span className="text-sm font-black text-emerald-900 font-mono">
                      R$ {autoCalculatedUnitCost} / {consumptionUnit}
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">NCM Fiscal</label>
                    <input
                      type="text"
                      value={ncm}
                      onChange={(e) => setNcm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 4: ATRIBUTOS / CARACTERÍSTICAS */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-extrabold text-amber-700 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-600" /> [ 4. ATRIBUTOS / CARACTERÍSTICAS ]
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Gramatura / Espessura</label>
                    <input
                      type="text"
                      placeholder="Ex: 180g, 300g, 80 micras"
                      value={grammage}
                      onChange={(e) => setGrammage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Formato / Dimensões</label>
                    <input
                      type="text"
                      placeholder="Ex: A4, 60cm x 50m, 66x96cm"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Acabamento / Cor</label>
                    <input
                      type="text"
                      placeholder="Ex: Brilho, Fosco, Branco"
                      value={finishType}
                      onChange={(e) => setFinishType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl font-extrabold hover:bg-sky-700 shadow-md cursor-pointer"
                >
                  Cadastrar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
