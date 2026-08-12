"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import QuotePdfModal from "@/components/QuotePdfModal";
import QuickQuoteModal from "@/components/QuickQuoteModal";
import { FileText, Plus, Search, Eye, Send, CreditCard, ExternalLink, Download } from "lucide-react";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  type: string;
  clientName: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  subtotalAmount: string;
  discountAmount: string;
  freightAmount: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  createdAt: string;
}

export default function OrcamentosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPdfOrder, setSelectedPdfOrder] = useState<Order | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              GESTÃO DE VENDAS & PROPOSTAS
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Orçamentos & Pedidos</h1>
            <p className="text-xs text-slate-500">
              Gere propostas comerciais em PDF, links de pagamento InfinitePay e envie via WhatsApp ou E-mail.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Criar Novo Orçamento
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código (PV/ORC), nome do cliente ou telefone..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3 text-center">Pagamento</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-extrabold text-sky-700">{o.code}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        o.type === "quote" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {o.type === "quote" ? "ORÇAMENTO" : "PEDIDO"}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{o.clientName}</td>
                  <td className="p-3 text-slate-500">{formatDateOnly(o.createdAt)}</td>
                  <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(o.totalAmount)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.paymentStatus === "paid" ? "PAGO" : "PENDENTE"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedPdfOrder(o)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Proposta PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPdfOrder && (
        <QuotePdfModal order={selectedPdfOrder} onClose={() => setSelectedPdfOrder(null)} />
      )}
      {showNewModal && <QuickQuoteModal onClose={() => setShowNewModal(false)} />}
    </MainLayout>
  );
}
