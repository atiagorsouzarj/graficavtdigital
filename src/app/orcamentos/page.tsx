"use client";

import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/MainLayout";
import QuotePdfModal from "@/components/QuotePdfModal";
import QuickQuoteModal from "@/components/QuickQuoteModal";
import EditQuoteModal from "@/components/EditQuoteModal";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Send,
  AlertTriangle,
  Loader2,
  X,
  CreditCard,
  Download,
  Eye,
} from "lucide-react";
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
  notes?: string;
  items?: Array<{ productName: string; quantity: number; unitPrice: string; totalPrice: string }>;
}

interface ToastMsg {
  id: number;
  type: "success" | "error" | "info";
  text: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  sent: { label: "Enviado", color: "bg-sky-100 text-sky-800" },
  art_approval: { label: "Aguardando Arte", color: "bg-amber-100 text-amber-800" },
  art_pending: { label: "Arte com Ajustes", color: "bg-orange-100 text-orange-800" },
  production_ready: { label: "Pronto p/ Produção", color: "bg-indigo-100 text-indigo-800" },
  in_printing: { label: "Em Impressão", color: "bg-purple-100 text-purple-800" },
  finishing: { label: "Em Acabamento", color: "bg-cyan-100 text-cyan-800" },
  ready_for_pickup: { label: "Pronto p/ Retirada", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Concluído", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function OrcamentosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPdfOrder, setSelectedPdfOrder] = useState<Order | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const showToast = (type: ToastMsg["type"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "quote") return orders.filter((o) => o.type === "quote");
    if (activeTab === "order") return orders.filter((o) => o.type === "order" || o.type !== "quote");
    if (activeTab === "open")
      return orders.filter((o) => !["completed", "cancelled"].includes(o.status));
    if (activeTab === "paid") return orders.filter((o) => o.paymentStatus === "paid");
    return orders;
  }, [orders, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.paymentStatus === "paid").length;
    const pending = total - paid;
    const inProduction = orders.filter(
      (o) => !["completed", "cancelled", "ready_for_pickup"].includes(o.status)
    ).length;
    const totalValue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((acc, o) => acc + parseFloat(o.totalAmount || "0"), 0);
    return { total, paid, pending, inProduction, totalValue };
  }, [orders]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Excluir o pedido ${code}? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        showToast("success", `Pedido ${code} excluído.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "Erro ao excluir.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Erro de conexão.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (id: string, code: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          paymentStatus: "paid",
        }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: "completed", paymentStatus: "paid" } : o
          )
        );
        showToast("success", `✅ ${code} aprovado e marcado como pago!`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "Erro ao aprovar.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Erro de conexão.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleWhatsApp = (order: Order) => {
    const phone = (order.clientPhone || "").replace(/\D/g, "");
    const text = encodeURIComponent(
      `Olá *${order.clientName}*! 👋\n\n` +
        `Segue seu pedido *${order.code}*:\n` +
        `💰 Total: *R$ ${formatCurrency(order.totalAmount)}*\n` +
        `📅 Data: ${formatDateOnly(order.createdAt)}\n\n` +
        `Qualquer dúvida, estou à disposição!\n` +
        `— *PrintFlow Gráfica Criativa*`
    );
    const url = phone
      ? `https://wa.me/55${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              GESTÃO DE VENDAS, PROPOSTAS & SERVIÇOS
            </span>
            <h1 className="text-2xl font-bold text-slate-800">
              Orçamentos, Pedidos e Serviços Precificados
            </h1>
            <p className="text-xs text-slate-500">
              Crie, edite, aprove e envie pedidos via WhatsApp. Tudo automatizado.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Criar Novo Orçamento
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
            <span className="text-xl font-black text-slate-800">{stats.total}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">Pagos</span>
            <span className="text-xl font-black text-emerald-700">{stats.paid}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-amber-600 uppercase block">Pendentes</span>
            <span className="text-xl font-black text-amber-700">{stats.pending}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">Em Produção</span>
            <span className="text-xl font-black text-purple-700">{stats.inProduction}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-sky-600 uppercase block">Recebido</span>
            <span className="text-base font-black text-sky-700">
              {formatCurrency(stats.totalValue.toFixed(2))}
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, cliente, CPF/CNPJ ou telefone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 font-bold">
            {[
              { id: "all", label: "Todos" },
              { id: "quote", label: "Orçamentos" },
              { id: "order", label: "Pedidos" },
              { id: "open", label: "Em Aberto" },
              { id: "paid", label: "Pagos" },
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Pagto</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" />
                      Carregando pedidos...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      <AlertTriangle className="w-5 h-5 inline-block mr-2 text-amber-500" />
                      Nenhum pedido encontrado.
                      <br />
                      <button
                        onClick={() => setShowNewModal(true)}
                        className="mt-2 text-sky-600 hover:underline font-bold"
                      >
                        Criar o primeiro orçamento
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const st = STATUS_LABEL[o.status] || STATUS_LABEL.draft;
                    const isApproving = approvingId === o.id;
                    const isDeleting = deletingId === o.id;
                    const canApprove = o.status !== "completed" && o.status !== "cancelled";

                    return (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-extrabold text-sky-700 whitespace-nowrap">
                          {o.code}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              o.type === "quote"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {o.type === "quote" ? "ORÇAMENTO" : "PEDIDO"}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800 max-w-[180px] truncate">
                          {o.clientName}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${st.color}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {formatDateOnly(o.createdAt)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              o.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.paymentStatus === "paid" ? "PAGO" : "PENDENTE"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedPdfOrder(o)}
                              title="Visualizar / Imprimir"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                            </button>
                            <button
                              onClick={() => setEditingOrder(o)}
                              title="Editar"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                            {canApprove && (
                              <button
                                onClick={() => handleApprove(o.id, o.code)}
                                disabled={isApproving}
                                title="Aprovar e marcar como pago"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer disabled:opacity-50"
                              >
                                {isApproving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleWhatsApp(o)}
                              title="Enviar por WhatsApp"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(o.id, o.code)}
                              disabled={isDeleting}
                              title="Excluir"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg cursor-pointer disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPdfOrder && (
        <QuotePdfModal
          order={selectedPdfOrder}
          onClose={() => setSelectedPdfOrder(null)}
        />
      )}
      {showNewModal && (
        <QuickQuoteModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchOrders();
            showToast("success", "Orçamento criado com sucesso!");
          }}
        />
      )}
      {editingOrder && (
        <EditQuoteModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={() => {
            fetchOrders();
            showToast("success", `Pedido ${editingOrder.code} atualizado!`);
          }}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-right duration-200 ${
              t.type === "success"
                ? "bg-emerald-600 text-white"
                : t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-white"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : t.type === "error" ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{t.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
