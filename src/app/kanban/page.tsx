"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Kanban as KanbanIcon,
  Palette,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Plus,
  GripVertical,
  Globe,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const columns = [
  { id: "art_pending", title: "Aguardando Arte / Rascunho", color: "border-slate-200 bg-slate-100/70" },
  { id: "art_approval", title: "Arte em Aprovação", color: "border-amber-200 bg-amber-50/50" },
  { id: "production_ready", title: "Pronto P/ Produção", color: "border-sky-200 bg-sky-50/50" },
  { id: "in_printing", title: "Em Impressão", color: "border-purple-200 bg-purple-50/50" },
  { id: "finishing", title: "Acabamento & Corte", color: "border-indigo-200 bg-indigo-50/50" },
  { id: "ready_for_pickup", title: "Aguardando Retirada/Envio", color: "border-blue-200 bg-blue-50/50" },
  { id: "completed", title: "Concluído / Entregue", color: "border-emerald-200 bg-emerald-50/50" },
];

function SortableCard({
  order,
  colId,
  moveOrder,
  setSelectedArtOrder,
}: {
  order: Order;
  colId: string;
  moveOrder: (id: string, nextStatus: string) => void;
  setSelectedArtOrder: (order: Order) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id, data: { order, colId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-2 text-xs relative group select-none cursor-grab active:cursor-grabbing ${
        isDragging ? "border-dashed border-sky-400 bg-sky-50/30" : ""
      }`}
    >
      {/* Top row: Code + Payment Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="font-mono font-extrabold text-sky-700 text-xs">
            {order.code}
          </span>
        </div>

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

      {/* Customer Name & Item */}
      <div>
        <p className="font-bold text-slate-800 text-xs line-clamp-1">{order.clientName}</p>
        <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
          {order.items && order.items.length > 0 ? order.items[0].productName : "Impressão Gráfica"}
        </p>
      </div>

      {/* Button for Digital Proof (stop drag propagation on click) */}
      {order.status === "art_approval" && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedArtOrder(order);
          }}
          className="w-full mt-1 p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-800 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-amber-600" />
          <span>Ver Prova Digital</span>
        </button>
      )}

      {/* Card Footer: Amount + Quick Move Arrows */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <span className="font-bold text-slate-800">{formatCurrency(order.totalAmount)}</span>

        <div
          className="flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = columns.findIndex((c) => c.id === colId);
              if (idx > 0) moveOrder(order.id, columns[idx - 1].id);
            }}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
            title="Mover para esquerda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = columns.findIndex((c) => c.id === colId);
              if (idx < columns.length - 1) moveOrder(order.id, columns[idx + 1].id);
            }}
            className="p-1 bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Mover para direita"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({
  col,
  colOrders,
  moveOrder,
  setSelectedArtOrder,
}: {
  col: typeof columns[0];
  colOrders: Order[];
  moveOrder: (id: string, nextStatus: string) => void;
  setSelectedArtOrder: (order: Order) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-2xl border ${col.color} p-3 space-y-3 transition-all ${
        isOver ? "border-sky-400 bg-sky-100/70 shadow-md ring-2 ring-sky-300" : "shadow-2xs"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
          {col.title}
        </span>
        <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
          {colOrders.length}
        </span>
      </div>

      <SortableContext
        items={colOrders.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2.5 min-h-[140px]">
          {colOrders.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs italic border border-dashed border-slate-200/80 rounded-xl bg-white/40">
              Solte um pedido aqui
            </div>
          ) : (
            colOrders.map((order) => (
              <SortableCard
                key={order.id}
                order={order}
                colId={col.id}
                moveOrder={moveOrder}
                setSelectedArtOrder={setSelectedArtOrder}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedArtOrder, setSelectedArtOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

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
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );

    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      fetchOrders();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = orders.find((o) => o.id === active.id);
    if (found) setActiveOrder(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;

    const orderId = active.id as string;
    const targetColId = over.id as string;

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    let finalColId = targetColId;
    if (!columns.some((c) => c.id === targetColId)) {
      const targetCard = orders.find((o) => o.id === targetColId);
      if (targetCard) {
        finalColId = targetCard.status;
      } else {
        return;
      }
    }

    if (order.status !== finalColId) {
      moveOrder(orderId, finalColId);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
                FLUXO DE PRODUÇÃO GRÁFICA
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <GripVertical className="w-3 h-3" /> Clique & Arraste Habilitado
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Kanban de Pedidos</h1>
            <p className="text-xs text-slate-500">
              Clique e arraste qualquer card para trocar de coluna e atualizar o status da produção.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/portal"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" /> Portal do Cliente
            </a>
            <a
              href="/orcamentos"
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Pedido
            </a>
          </div>
        </div>

        {/* Kanban Board Drag & Drop Context */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-220px)]">
            {columns.map((col) => {
              const colOrders = orders.filter((o) => o.status === col.id);
              return (
                <DroppableColumn
                  key={col.id}
                  col={col}
                  colOrders={colOrders}
                  moveOrder={moveOrder}
                  setSelectedArtOrder={setSelectedArtOrder}
                />
              );
            })}
          </div>

          {/* Straight Floating Card Overlay - Clean Dragging View */}
          <DragOverlay dropAnimation={null}>
            {activeOrder ? (
              <div className="bg-white p-3.5 rounded-xl border-2 border-sky-500 shadow-2xl space-y-2 text-xs w-68 cursor-grabbing select-none pointer-events-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-mono font-extrabold text-sky-700 text-xs">
                      {activeOrder.code}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {activeOrder.paymentStatus === "paid" ? "PAGO" : "PENDENTE"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">{activeOrder.clientName}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {activeOrder.items && activeOrder.items.length > 0
                      ? activeOrder.items[0].productName
                      : "Impressão Gráfica"}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800">{formatCurrency(activeOrder.totalAmount)}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Art Proof Modal */}
      {selectedArtOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedArtOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
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
                className="max-h-64 mx-auto rounded-lg shadow-2xs object-contain"
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
                  className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg font-semibold hover:bg-red-200 cursor-pointer"
                >
                  Solicitar Ajustes
                </button>
                <button
                  onClick={() => {
                    moveOrder(selectedArtOrder.id, "production_ready");
                    setSelectedArtOrder(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 cursor-pointer"
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
