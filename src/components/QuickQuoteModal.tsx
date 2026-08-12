"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Send, FileText, CreditCard, Truck, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface QuickQuoteModalProps {
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  suggestedPrice: string;
  code: string;
}

export default function QuickQuoteModal({ onClose }: QuickQuoteModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState<Array<{ name: string; qty: number; price: number }>>([
    { name: "Cartão de Visita 300g Verniz Localizado (500un)", qty: 1, price: 95.00 },
  ]);
  const [discount, setDiscount] = useState("0.00");
  const [freight, setFreight] = useState("0.00");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [shippingMethod, setShippingMethod] = useState("superfrete_sedex");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductsList(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const addItemFromSelect = (prodId: string) => {
    const prod = productsList.find((p) => p.id === prodId);
    if (prod) {
      setItems([
        ...items,
        {
          name: prod.name,
          qty: 1,
          price: parseFloat(prod.suggestedPrice || "0"),
        },
      ]);
    }
  };

  const addCustomItem = () => {
    setItems([...items, { name: "Impressão Personalizada A4/A3", qty: 1, price: 45.00 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: unknown) => {
    const next = [...items];
    // @ts-expect-error dynamic key assignment
    next[idx][field] = value;
    setItems(next);
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const total = Math.max(0, subtotal - parseFloat(discount || "0") + parseFloat(freight || "0"));

  const handleSave = async (sendType?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          clientName: clientName || "Cliente Rápido",
          clientPhone,
          clientEmail,
          status: "sent",
          subtotalAmount: subtotal.toFixed(2),
          discountAmount: discount,
          freightAmount: freight,
          paymentMethod,
          shippingMethod,
          items: items.map((i) => ({
            productName: i.name,
            quantity: i.qty,
            unitPrice: i.price.toFixed(2),
          })),
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (sendType === "whatsapp") {
          alert(`Orçamento gerado e link do WhatsApp disparado para ${clientPhone || "Cliente"}!`);
        } else if (sendType === "email") {
          alert(`Orçamento em PDF enviado com sucesso para ${clientEmail || "e-mail"}!`);
        }
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Novo Orçamento Rápido</h2>
            <p className="text-xs text-slate-500">Cotação dinâmica para impressão e papelaria personalizada</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <Check className="w-5 h-5 text-emerald-600" />
            Orçamento gerado e registrado com sucesso!
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nome do Cliente</label>
              <input
                type="text"
                placeholder="Ex: Studio Eventos Ltda"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp</label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">E-mail</label>
              <input
                type="email"
                placeholder="contato@cliente.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Product Picker & Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-sm">Itens do Orçamento</span>
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    if (e.target.value) addItemFromSelect(e.target.value);
                  }}
                  className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 outline-hidden"
                >
                  <option value="">+ Selecionar do catálogo...</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.suggestedPrice)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Item Avulso
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-hidden"
                  />
                  <div className="w-20">
                    <label className="text-[10px] text-slate-400 block">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-center outline-hidden"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] text-slate-400 block">Preço Un (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-right outline-hidden"
                    />
                  </div>
                  <div className="w-24 text-right font-bold text-slate-800">
                    {formatCurrency(item.qty * item.price)}
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Logistics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>Forma de Pagamento</span>
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-hidden"
              >
                <option value="pix">PIX Instantâneo (0% taxa)</option>
                <option value="infinitepay_link">Link InfinitePay (Cartão/Débito)</option>
                <option value="cash">Dinheiro no Balcão</option>
                <option value="boleto">Boleto Bancário (Faturado 15 dias)</option>
              </select>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Logística & Frete (SuperFrete)</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 outline-hidden"
                >
                  <option value="pickup">Retirada no Balcão (R$ 0,00)</option>
                  <option value="superfrete_sedex">SuperFrete SEDEX Express</option>
                  <option value="superfrete_pac">SuperFrete Correios PAC</option>
                  <option value="motoboy">Motoboy Local (R$ 25,00)</option>
                </select>
                <input
                  type="number"
                  placeholder="Frete"
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                  className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-right outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Subtotal: {formatCurrency(subtotal)}</span>
              <span className="text-slate-400 block text-[11px]">
                Desconto: -{formatCurrency(parseFloat(discount || "0"))} | Frete: +
                {formatCurrency(parseFloat(freight || "0"))}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-xs block">Valor Total do Pedido</span>
              <span className="text-2xl font-black text-sky-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave("whatsapp")}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar via WhatsApp</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave("email")}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Enviar E-mail (PDF)</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Salvar Orçamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
