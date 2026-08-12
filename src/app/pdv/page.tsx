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
}

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientsList, setClientsList] = useState<ClientCRM[]>([]);
  const [search, setSearch] = useState("");

  // Cart & Client Selection
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([]);
  const [clientSearchQuery, setClientSearchQuery] = useState("Cliente Balcão");
  const [selectedClient, setSelectedClient] = useState<ClientCRM | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Payment
  const [discount, setDiscount] = useState("0.00");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receiptData, setReceiptData] = useState<ReceiptPayload | null>(null);

  const clientDropdownRef = useRef<HTMLDivElement>(null);

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

  const addToCart = (p: Product) => {
    const existing = cart.find((i) => i.id === p.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { id: p.id, name: p.name, price: parseFloat(p.suggestedPrice || "0"), qty: 1 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((i) => i.id !== id));
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, qty } : i)));
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const numDiscount = parseFloat(discount || "0");
  const total = Math.max(0, subtotal - numDiscount);
  const numReceived = parseFloat(receivedAmount || "0");
  const change = Math.max(0, numReceived - total);

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
        setReceiptData({
          receiptNumber: data.receiptNumber,
          clientName: selectedClient?.name || clientSearchQuery || "Cliente Balcão",
          clientDocument: selectedClient?.document || "172.595.737-08",
          clientAddress: "RUA LUZIA DE MACEDO DANTAS, 151",
          clientPhone: selectedClient?.whatsapp || selectedClient?.phone || "(21) 99690-2449",
          items: cart,
          subtotal,
          discount: numDiscount,
          total: total.toFixed(2),
          paymentMethod,
          receivedAmount,
          change: change.toFixed(2),
          date: new Date().toLocaleDateString("pt-BR"),
        });
        setCart([]);
        setDiscount("0.00");
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              FRENTE DE CAIXA RÁPIDA
            </span>
            <h1 className="text-2xl font-bold text-slate-800">PDV - Balcão Loja Física</h1>
            <p className="text-xs text-slate-500">Caixa aberto • Operador: Tiago Souza</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
            ● CAIXA ABERTO (R$ 150,00)
          </span>
        </div>

        {/* PDV Main Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Catalog & Quick Items (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto por nome ou código de barras..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all text-left space-y-1 cursor-pointer group"
                >
                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">{p.code}</span>
                  <span className="font-bold text-slate-800 text-xs line-clamp-2 block group-hover:text-sky-600">
                    {p.name}
                  </span>
                  <span className="text-sm font-extrabold text-sky-700 block pt-1 font-mono">
                    {formatCurrency(p.suggestedPrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cart & Checkout Panel (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-sky-600" />
                  <span className="font-bold text-slate-800 text-sm">Carrinho de Compras</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{cart.length} itens</span>
              </div>

              {/* CLIENT AUTO-COMPLETE SEARCH IN PDV */}
              <div className="relative" ref={clientDropdownRef}>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">CLIENTE (CRM / BALCÃO)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setSelectedClient(null);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-800 font-bold outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
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

              {/* Cart Items List */}
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 text-xs">
                {cart.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 italic">Carrinho vazio. Clique num produto.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{formatCurrency(item.price)} un</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-5 h-5 bg-slate-100 text-slate-700 rounded-md font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-5 h-5 bg-slate-100 text-slate-700 rounded-md font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-slate-800 w-16 text-right font-mono">
                        {formatCurrency(item.qty * item.price)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment & Totals */}
            <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-colors ${
                    paymentMethod === "cash"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" /> Dinheiro
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-colors ${
                    paymentMethod === "pix"
                      ? "bg-sky-50 border-sky-500 text-sky-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-sky-600" /> PIX
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-colors ${
                    paymentMethod === "card"
                      ? "bg-purple-50 border-purple-500 text-purple-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600" /> Cartão
                </button>
              </div>

              {paymentMethod === "cash" && (
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[10px] text-slate-500 block font-semibold">Valor Recebido</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md p-1 font-bold text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-semibold">Troco</label>
                    <span className="font-extrabold text-emerald-600 text-sm block mt-1 font-mono">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}

              {/* Totals Summary */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sky-400 font-extrabold text-lg pt-1 border-t border-slate-800">
                  <span>TOTAL:</span>
                  <span className="font-mono">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" /> FINALIZAR VENDA (F9)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 80mm Receipt Modal */}
      {receiptData && (
        <ThermalReceiptModal receipt={receiptData} onClose={() => setReceiptData(null)} />
      )}
    </MainLayout>
  );
}
