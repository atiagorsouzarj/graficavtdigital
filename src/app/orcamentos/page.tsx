"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import QuotePdfModal from "@/components/QuotePdfModal";
import QuickQuoteModal from "@/components/QuickQuoteModal";
import { FileText, Plus, Search, Eye, Send, CreditCard, ExternalLink, Download, Layers } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'quote', 'order', 'comunicacao_visual', 'dtf'
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

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "quote") return o.type === "quote";
    if (activeTab === "order") return o.type === "order";
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              GESTÃO DE VENDAS, PROPOSTAS & SERVIÇOS
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Orçamentos, Pedidos e Serviços Precificados</h1>
            <p className="text-xs text-slate-500">
              Gere propostas em PDF A4, links de pagamento InfinitePay e envie via WhatsApp para Gráfica, Papelaria, Comunicação Visual m² e Serviços DTF.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Criar Novo Orçamento
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (PV/ORC/CUP), nome do cliente, CPF/CNPJ ou telefone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 font-bold">
            {[
              { id: "all", label: "Todos os Pedidos" },
              { id: "quote", label: "Apenas Orçamentos" },
              { id: "order", label: "Ordens de Produção / PDV" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeTab === t.id
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
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
              {filteredOrders.map((o) => (
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
                  <td className="p-3 text-right font-mono font-bold text-slate-800">{formatCurrency(o.totalAmount)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.paymentStatus === "paid" ? "PAGO" : "PENDENTE"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedPdfOrder(o)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-600" /> Proposta PDF / Cupom
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
