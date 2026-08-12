"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Kanban as KanbanIcon,
  Palette,
  CheckCircle2,
  Clock,
  Printer,
  Scissors,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Eye,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  status: string;
  totalAmount: string;
  paymentStatus: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  createdAt: string;
  items?: Array<{ productName: string; quantity: number }>;
}

export default function KanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedArtOrder, setSelectedArtOrder] = useState<Order | null>(null);

  const columns = [
    { id: "art_pending", title: "Aguardando Arte / Rascunho", color: "border-slate-300 bg-slate-100/60" },
    { id: "art_approval", title: "Arte em Aprovação", color: "border-amber-300 bg-amber-50/50" },
    { id: "production_ready", title: "Pronto P/ Produção", color: "border-sky-300 bg-sky-50/50" },
    { id: "in_printing", title: "Em Impressão", color: "border-purple-300 bg-purple-50/50" },
    { id: "finishing", title: "Acabamento & Corte", color: "border-indigo-300 bg-indigo-50/50" },
    { id: "ready_for_pickup", title: "Aguardando Retirada/Envio", color: "border-blue-300 bg-blue-50/50" },
    { id: "completed", title: "Concluído / Entregue", color: "border-emerald-300 bg-emerald-50/50" },
  ];

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const moveOrder = async (id: string, nextStatus: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              FLUXO DE PRODUÇÃO GRÁFICA
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Kanban de Pedidos</h1>
            <p className="text-xs text-slate-500">
              Acompanhamento em tempo real desde a aprovação de arte até o acabamento e despacho.
            </p>
          </div>

          <a
            href="/orcamentos"
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Novo Pedido
          </a>
        </div>

        {/* Kanban Board Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-220px)]">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.id);
            return (
              <div
                key={col.id}
                className={`w-72 shrink-0 rounded-2xl border ${col.color} p-3 space-y-3 shadow-xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                    {col.title}
                  </span>
                  <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
                  {colOrders.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
                      Nenhum pedido nesta fase
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2 text-xs relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-sky-700 text-xs">
                            {order.code}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "PAGO" : "PENDENTE"}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-slate-800 text-xs line-clamp-1">{order.clientName}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {order.items && order.items.length > 0 ? order.items[0].productName : "Impressão Gráfica"}
                          </p>
                        </div>

                        {/* Art Status indicator if in art approval */}
                        {order.status === "art_approval" && (
                          <button
                            onClick={() => setSelectedArtOrder(order)}
                            className="w-full mt-1 p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-800 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Palette className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ver Prova Digital</span>
                          </button>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="font-bold text-slate-800">{formatCurrency(order.totalAmount)}</span>

                          {/* Stage Transition Arrows */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const idx = columns.findIndex((c) => c.id === col.id);
                                if (idx > 0) moveOrder(order.id, columns[idx - 1].id);
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
                              title="Voltar etapa"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                const idx = columns.findIndex((c) => c.id === col.id);
                                if (idx < columns.length - 1) moveOrder(order.id, columns[idx + 1].id);
                              }}
                              className="p-1 bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-md transition-colors cursor-pointer"
                              title="Avançar etapa"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Art Proof Modal */}
      {selectedArtOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedArtOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-800">
                Prova Digital - {selectedArtOrder.code} ({selectedArtOrder.clientName})
              </h3>
            </div>

            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center mb-4">
              <img
                src={selectedArtOrder.artMockupUrl || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80"}
                alt="Prova Digital"
                className="max-h-64 mx-auto rounded-lg shadow-xs object-contain"
              />
              <p className="text-xs text-slate-500 mt-2 italic">
                {selectedArtOrder.artNotes || "Validação de gabarito e perfil de cores CMYK."}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs">
              <a
                href={`/aprovar-arte/${selectedArtOrder.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
              >
                Abrir Portal do Cliente <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    moveOrder(selectedArtOrder.id, "art_pending");
                    setSelectedArtOrder(null);
                  }}
                  className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg font-semibold hover:bg-red-200"
                >
                  Solicitar Ajustes
                </button>
                <button
                  onClick={() => {
                    moveOrder(selectedArtOrder.id, "production_ready");
                    setSelectedArtOrder(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Aprovar & Enviar Produção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
