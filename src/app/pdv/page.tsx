"use client";

import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/MainLayout";
import ThermalReceiptModal from "@/components/ThermalReceiptModal";
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  CheckCircle2,
  User,
  X,
  Check,
  Zap,
  Tag,
  Percent,
  History,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Barcode,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  suggestedPrice: string;
  code: string;
  category: string;
}

interface ClientCRM {
  id: string;
  name: string;
  tradeName?: string;
  document: string;
  email: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
}

interface ReceiptPayload {
  receiptNumber: string;
  clientName: string;
  clientDocument?: string;
  clientAddress?: string;
  clientPhone?: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  discount: number;
  total: string;
  paymentMethod: string;
  receivedAmount?: string;
  change?: string;
  date: string;
  time?: string;
  sellerName?: string;
}

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientsList, setClientsList] = useState<ClientCRM[]>([]);
  const [search, setSearch] = useState("");

  // Cart & Client Selection
  const [cart, setCart] = useState<
    Array<{ id: string; name: string; price: number; qty: number }>
  >([]);
  const [clientSearchQuery, setClientSearchQuery] = useState("Cliente Balcão");
  const [selectedClient, setSelectedClient] = useState<ClientCRM | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Discount & Payment
  const [discountType, setDiscountType] = useState<"value" | "percent">("value");
  const [discountInput, setDiscountInput] = useState("0.00");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pix" | "card">("cash");
  const [receiptData, setReceiptData] = useState<ReceiptPayload | null>(null);

  // Today's Sales History
  const [todaySales, setTodaySales] = useState<ReceiptPayload[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [barcodeBipSuccess, setBarcodeBipSuccess] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Load Products and Clients
  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([prodsData, clientsData]) => {
        if (Array.isArray(prodsData)) setProducts(prodsData);
        if (Array.isArray(clientsData)) setClientsList(clientsData);
      })
      .catch((err) => console.error(err));
  }, []);

  // Keyboard Shortcuts (F2, F3, F4, F5, F6, F9, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        clientInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        setPaymentMethod("cash");
      } else if (e.key === "F5") {
        e.preventDefault();
        setPaymentMethod("pix");
      } else if (e.key === "F6") {
        e.preventDefault();
        setPaymentMethod("card");
      } else if (e.key === "F9") {
        e.preventDefault();
        if (cart.length > 0) handleCheckout();
      } else if (e.key === "Escape") {
        setCart([]);
        setSearch("");
        setDiscountInput("0.00");
        setReceivedAmount("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, selectedClient, clientSearchQuery, paymentMethod, discountInput, receivedAmount]);

  const addToCart = (p: Product) => {
    const existing = cart.find((i) => i.id === p.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([
        ...cart,
        { id: p.id, name: p.name, price: parseFloat(p.suggestedPrice || "0"), qty: 1 },
      ]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((i) => i.id !== id));
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, qty } : i)));
    }
  };

  // Barcode Scanner / Enter to Auto-Add
  const handleProductSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      const match = products.find(
        (p) =>
          p.code.toLowerCase() === search.trim().toLowerCase() ||
          p.name.toLowerCase().includes(search.trim().toLowerCase())
      );
      if (match) {
        addToCart(match);
        setSearch("");
        setBarcodeBipSuccess(true);
        setTimeout(() => setBarcodeBipSuccess(false), 1200);
      }
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

  let numDiscount = 0;
  const parsedDiscountVal = parseFloat(discountInput || "0");
  if (discountType === "percent") {
    numDiscount = (subtotal * parsedDiscountVal) / 100;
  } else {
    numDiscount = parsedDiscountVal;
  }

  const total = Math.max(0, subtotal - numDiscount);
  const numReceived = parseFloat(receivedAmount || "0");
  const change = Math.max(0, numReceived - total);

  // Quick Cash Bills (R$ 10, R$ 20, R$ 50, R$ 100, R$ 200, Exact)
  const setCashQuickAmount = (amt: number) => {
    setReceivedAmount(amt.toFixed(2));
  };

  const handleSelectClient = (c: ClientCRM) => {
    setSelectedClient(c);
    setClientSearchQuery(c.name);
    setShowClientDropdown(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch("/api/pdv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient?.id || null,
          clientName: selectedClient?.name || clientSearchQuery || "Cliente Balcão PDV",
          clientDocument: selectedClient?.document || "",
          clientPhone: selectedClient?.whatsapp || selectedClient?.phone || "",
          items: cart,
          discount: numDiscount.toFixed(2),
          paymentMethod,
          receivedAmount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const newReceipt: ReceiptPayload = {
          receiptNumber: data.receiptNumber || `CUP-${Math.floor(100000 + Math.random() * 900000)}`,
          clientName: selectedClient?.name || clientSearchQuery || "Cliente Balcão",
          clientDocument: selectedClient?.document || "172.595.737-08",
          clientAddress: "RUA LUZIA DE MACEDO DANTAS, 151",
          clientPhone: selectedClient?.whatsapp || selectedClient?.phone || "(21) 99690-2449",
          items: [...cart],
          subtotal,
          discount: numDiscount,
          total: total.toFixed(2),
          paymentMethod,
          receivedAmount: receivedAmount || total.toFixed(2),
          change: change.toFixed(2),
          date: new Date().toLocaleDateString("pt-BR"),
          time: timeNow,
          sellerName: "TIAGO SOUZA",
        };

        setReceiptData(newReceipt);
        setTodaySales((prev) => [newReceipt, ...prev]);
        setCart([]);
        setDiscountInput("0.00");
        setReceivedAmount("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClients = clientsList.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.document.includes(clientSearchQuery)
  );

  return (
    <MainLayout>
      <div className="space-y-4">
        
        {/* Header with Caixa Info & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                FRENTE DE CAIXA RÁPIDA (PDV BALCÃO)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CAIXA ABERTO
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white">PDV — Vendas Loja Física</h1>
            <p className="text-xs text-slate-400">
              Operador: <strong>Tiago Souza</strong> • Aberto às 08:30 • Atendimento de Balcão e Retirada
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span>Vendas Hoje ({todaySales.length})</span>
            </button>

            <div className="hidden lg:flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-mono text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>[F2] Busca • [F3] Cliente • [F9] Finalizar</span>
            </div>
          </div>
        </div>

        {/* Bip Notification Toast */}
        {barcodeBipSuccess && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Item bipado e adicionado ao carrinho com sucesso!</span>
          </div>
        )}

        {/* PDV Main 3-Column Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Catalog & Search (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Search Bar with Barcode Scanner Indicator */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleProductSearchKeyDown}
                placeholder="[F2] Buscar por nome ou bipar código de barras + Enter..."
                className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-24 py-3 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 outline-hidden font-medium shadow-2xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5" /> Bipador
              </span>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all text-left space-y-1.5 cursor-pointer group select-none relative"
                >
                  <span className="text-[10px] font-mono text-slate-400 font-extrabold block uppercase">
                    {p.code}
                  </span>
                  <span className="font-bold text-slate-800 text-xs line-clamp-2 block group-hover:text-sky-600">
                    {p.name}
                  </span>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-sm font-black text-sky-700 font-mono">
                      {formatCurrency(p.suggestedPrice)}
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart & Payment Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-sky-600" />
                  <span className="font-extrabold text-slate-800 text-sm">Carrinho de Compras</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cart.length} itens
                  </span>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      Limpar [ESC]
                    </button>
                  )}
                </div>
              </div>

              {/* Client Auto-Complete Search */}
              <div className="relative" ref={clientDropdownRef}>
                <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">
                  [F3] CLIENTE (CRM / BALCÃO)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={clientInputRef}
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setSelectedClient(null);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="[F3] Nome ou CPF/CNPJ do cliente..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-bold outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Dropdown Menu */}
                {showClientDropdown && clientSearchQuery.trim() && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 max-h-48 overflow-y-auto space-y-1">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full text-left p-2 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors block text-xs"
                      >
                        <strong className="text-slate-800 block">{c.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.document} • {c.whatsapp || c.email}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Items Table */}
              <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto pr-1 text-xs">
                {cart.length === 0 ? (
                  <div className="text-slate-400 text-center py-8 italic space-y-1">
                    <p>Carrinho vazio.</p>
                    <p className="text-[10px]">Pressione [F2] ou clique num produto ao lado.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{formatCurrency(item.price)} un</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-5 h-5 bg-slate-100 text-slate-700 rounded-md font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-5 h-5 bg-slate-100 text-slate-700 rounded-md font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-slate-800 w-16 text-right font-mono text-xs">
                        {formatCurrency(item.qty * item.price)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Discounts, Payment Methods & Totals */}
            <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
              
              {/* Discount Controls */}
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>DESCONTO NO SUB-TOTAL:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDiscountType("value")}
                      className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                        discountType === "value"
                          ? "bg-sky-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("percent")}
                      className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                        discountType === "percent"
                          ? "bg-sky-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step="0.01"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-800 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Payment Methods Buttons [F4], [F5], [F6] */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-300"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">[F4] Dinheiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                    paymentMethod === "pix"
                      ? "bg-sky-50 border-sky-500 text-sky-900 shadow-xs ring-2 ring-sky-300"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-sky-600" />
                  <span className="text-[11px]">[F5] PIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "bg-purple-50 border-purple-500 text-purple-900 shadow-xs ring-2 ring-purple-300"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-[11px]">[F6] Cartão</span>
                </button>
              </div>

              {/* Cash Quick Bill Buttons (R$ 10, R$ 20, R$ 50, R$ 100, R$ 200) */}
              {paymentMethod === "cash" && (
                <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-extrabold text-emerald-900 block uppercase">
                    CÉDULA RECEBIDA DO CLIENTE (CÁLCULO AUTOMÁTICO DE TROCO):
                  </span>

                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setCashQuickAmount(total)}
                      className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 font-black rounded-lg text-[10px] hover:bg-emerald-100 cursor-pointer"
                    >
                      Exato ({formatCurrency(total)})
                    </button>
                    {[10, 20, 50, 100, 200].map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setCashQuickAmount(note)}
                        className="px-2 py-1 bg-white border border-emerald-300 text-emerald-900 font-bold rounded-lg text-[10px] hover:bg-emerald-100 cursor-pointer"
                      >
                        R$ {note}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-emerald-900 block font-bold">Valor Pago</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 font-extrabold text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-900 block font-bold">Troco a Devolver</label>
                      <span className="font-black text-emerald-700 text-base block mt-0.5 font-mono">
                        {formatCurrency(change)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Totals Summary Card */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 shadow-md">
                <div className="flex justify-between text-slate-400 text-xs font-semibold">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>

                {numDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs font-semibold">
                    <span>Desconto Aplicado:</span>
                    <span className="font-mono">- {formatCurrency(numDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sky-400 font-black text-xl pt-2 border-t border-slate-800">
                  <span>TOTAL:</span>
                  <span className="font-mono">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout F9 Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>FINALIZAR VENDA [F9]</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Today's Sales History Drawer Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Vendas Realizadas Hoje no PDV</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-2 text-xs">
              {todaySales.length === 0 ? (
                <p className="text-center text-slate-400 py-8 italic">Nenhuma venda realizada neste caixa hoje ainda.</p>
              ) : (
                todaySales.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sky-700">{s.receiptNumber}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md uppercase">
                          {s.paymentMethod}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{s.clientName}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{s.time} • {s.items.length} itens</span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-black text-slate-900 text-sm font-mono block">{formatCurrency(parseFloat(s.total))}</span>
                      <button
                        onClick={() => {
                          setReceiptData(s);
                          setShowHistoryModal(false);
                        }}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Reimprimir Cupom
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 80mm Receipt Modal */}
      {receiptData && (
        <ThermalReceiptModal receipt={receiptData} onClose={() => setReceiptData(null)} />
      )}
    </MainLayout>
  );
}
