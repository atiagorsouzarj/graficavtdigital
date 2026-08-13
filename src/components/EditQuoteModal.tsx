"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  id?: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
}

interface Order {
  id: string;
  code: string;
  type: string;
  status: string;
  clientName: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  subtotalAmount: string;
  discountAmount: string;
  freightAmount: string;
  totalAmount: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  notes?: string;
  items?: OrderItem[];
}

interface EditQuoteModalProps {
  order: Order;
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS = [
  { id: "draft", label: "Rascunho" },
  { id: "sent", label: "Enviado" },
  { id: "art_approval", label: "Aguardando Aprovação de Arte" },
  { id: "art_pending", label: "Arte com Ajustes" },
  { id: "production_ready", label: "Pronto para Produção" },
  { id: "in_printing", label: "Em Impressão" },
  { id: "finishing", label: "Em Acabamento" },
  { id: "ready_for_pickup", label: "Pronto para Retirada" },
  { id: "completed", label: "Concluído" },
  { id: "cancelled", label: "Cancelado" },
];

const PAYMENT_OPTIONS = [
  { id: "pending", label: "Pendente" },
  { id: "paid", label: "Pago" },
];

const PAYMENT_METHOD_OPTIONS = [
  { id: "cash", label: "Dinheiro" },
  { id: "pix", label: "PIX" },
  { id: "card", label: "Cartão" },
  { id: "infinitepay_link", label: "Link InfinitePay" },
  { id: "bank_transfer", label: "Transferência" },
  { id: "faturado", label: "Faturado (PJ)" },
];

const SHIPPING_OPTIONS = [
  { id: "pickup", label: "Retirada no Balcão" },
  { id: "superfrete_pac", label: "Correios PAC" },
  { id: "superfrete_sedex", label: "Correios SEDEX" },
  { id: "jadlog", label: "Jadlog" },
  { id: "motoboy", label: "Motoboy (15km)" },
];

const TYPE_OPTIONS = [
  { id: "quote", label: "Orçamento" },
  { id: "order", label: "Pedido / Ordem de Produção" },
  { id: "comunicacao_visual", label: "Comunicação Visual (m²)" },
  { id: "dtf", label: "DTF / Sublimação" },
];

export default function EditQuoteModal({ order, onClose, onSaved }: EditQuoteModalProps) {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    type: order.type || "quote",
    status: order.status || "draft",
    clientName: order.clientName || "",
    clientDocument: order.clientDocument || "",
    clientPhone: order.clientPhone || "",
    clientEmail: order.clientEmail || "",
    paymentStatus: order.paymentStatus || "pending",
    paymentMethod: order.paymentMethod || "pix",
    shippingMethod: order.shippingMethod || "pickup",
    notes: order.notes || "",
    discountAmount: order.discountAmount || "0.00",
    freightAmount: order.freightAmount || "0.00",
  });

  const [items, setItems] = useState<OrderItem[]>(
    order.items && order.items.length > 0
      ? order.items.map((it) => ({ ...it }))
      : [{ productName: "", quantity: 1, unitPrice: "0.00", totalPrice: "0.00" }]
  );

  // Recalcula subtotal e total em tempo real
  const subtotal = items.reduce((acc, it) => {
    const q = Number(it.quantity) || 0;
    const p = parseFloat(String(it.unitPrice)) || 0;
    return acc + q * p;
  }, 0);

  const discount = parseFloat(form.discountAmount) || 0;
  const freight = parseFloat(form.freightAmount) || 0;
  const total = Math.max(0, subtotal - discount + freight);

  const updateItem = (idx: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [field]: value };
        // recalcula totalPrice
        const q = Number(updated.quantity) || 0;
        const p = parseFloat(String(updated.unitPrice)) || 0;
        updated.totalPrice = (q * p).toFixed(2);
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { productName: "", quantity: 1, unitPrice: "0.00", totalPrice: "0.00" }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setErrorMsg("");

    // Validações
    if (!form.clientName.trim()) {
      setErrorMsg("Informe o nome do cliente.");
      return;
    }
    if (items.length === 0 || !items.some((it) => it.productName.trim())) {
      setErrorMsg("Adicione ao menos um item com descrição.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        subtotalAmount: subtotal.toFixed(2),
        discountAmount: discount.toFixed(2),
        freightAmount: freight.toFixed(2),
        totalAmount: total.toFixed(2),
        items: items
          .filter((it) => it.productName.trim())
          .map((it) => ({
            productName: it.productName,
            quantity: Number(it.quantity) || 0,
            unitPrice: parseFloat(String(it.unitPrice)).toFixed(2),
            totalPrice: (
              (Number(it.quantity) || 0) * (parseFloat(String(it.unitPrice)) || 0)
            ).toFixed(2),
          })),
      };

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Erro ao salvar o pedido.");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-sky-600 tracking-wider block">
              EDITAR PEDIDO
            </span>
            <span className="font-mono font-black text-slate-800 text-base">{order.code}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
              ⚠ {errorMsg}
            </div>
          )}

          {/* Tipo + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                Tipo
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-semibold outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                Etapa no Kanban
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-semibold outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Nome / Razão Social *"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500 font-bold"
              />
              <input
                value={form.clientDocument}
                onChange={(e) => setForm({ ...form, clientDocument: e.target.value })}
                placeholder="CPF / CNPJ"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              <input
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                placeholder="Telefone / WhatsApp"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              <input
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                placeholder="E-mail"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Itens do Pedido
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] bg-sky-50 text-sky-700 hover:bg-sky-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Adicionar item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs"
                >
                  <input
                    value={it.productName}
                    onChange={(e) => updateItem(idx, "productName", e.target.value)}
                    placeholder="Descrição do produto / serviço"
                    className="col-span-12 sm:col-span-5 bg-white border border-slate-200 rounded-lg p-1.5 outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="Qtd"
                    className="col-span-4 sm:col-span-2 bg-white border border-slate-200 rounded-lg p-1.5 text-center outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={it.unitPrice}
                    onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                    placeholder="Unitário"
                    className="col-span-5 sm:col-span-2 bg-white border border-slate-200 rounded-lg p-1.5 text-right outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-slate-700">
                    {formatCurrency(it.totalPrice)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="col-span-1 sm:col-span-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1 flex justify-center"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totais + Desconto + Frete + Pagamento + Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Pagamento
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500 font-bold"
                >
                  {PAYMENT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  {PAYMENT_METHOD_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide pt-2">
                Entrega
              </h3>
              <select
                value={form.shippingMethod}
                onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {SHIPPING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Valores
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block">Desconto (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-right font-mono outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Frete (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.freightAmount}
                    onChange={(e) => setForm({ ...form, freightAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-right font-mono outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-mono font-bold">{formatCurrency(subtotal.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Desconto</span>
                  <span className="font-mono">- {formatCurrency(discount.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frete</span>
                  <span className="font-mono">+ {formatCurrency(freight.toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-slate-200 pt-1.5 mt-1.5">
                  <span>TOTAL</span>
                  <span className="text-sky-700 font-mono">{formatCurrency(total.toFixed(2))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
              Observações
            </h3>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Anotações internas, condições especiais, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
