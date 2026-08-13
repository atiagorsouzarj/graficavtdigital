"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Palette,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Copy,
  Check,
  User,
  Phone,
  MessageSquare,
  Sparkles,
  SendHorizontal,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  clientName: string;
  clientPhone?: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  totalAmount: string;
  items?: Array<{ productName: string; quantity: number }>;
}

export default function ArtApprovalIndexPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [designerMap, setDesignerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCopyDesignerSummary = (order: Order) => {
    const designerName = designerMap[order.id] || "Tiago Souza (Designer)";
    const productName =
      order.items && order.items.length > 0 ? order.items[0].productName : "Impressão Gráfica";

    const text = `🎨 *DEMANDA DE DESIGNER - PROVA DIGITAL*\n\n• *Pedido:* ${order.code}\n• *Cliente:* ${order.clientName}\n• *Item:* ${productName}\n• *Designer Responsável:* ${designerName}\n• *Observação:* ${order.artNotes || "Validação de gabarito e perfil de cores CMYK."}\n• *Link de Prova para o Cliente:* ${window.location.origin}/aprovar-arte/${order.code}`;

    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              GESTÃO DE PROVAS DIGITAIS DA GRÁFICA
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Área de Aprovação de Arte</h1>
            <p className="text-xs text-slate-500">
              Identifique clientes, pedidos e designers responsáveis. Envie os links individuais de prova diretamente para o cliente ou para a equipe de criação.
            </p>
          </div>

          <a
            href="/portal"
            target="_blank"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" /> Portal do Cliente
          </a>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const currentDesigner = designerMap[order.id] || "Tiago Souza (Designer)";
            const itemDesc =
              order.items && order.items.length > 0
                ? `${order.items[0].productName} (${order.items[0].quantity} un)`
                : "Impressão Gráfica Personalizada";

            const directApprovalUrl = `/aprovar-arte/${order.code || order.id}`;

            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4 text-xs relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Code + Status Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase">NÚMERO DO PEDIDO</span>
                      <span className="font-mono font-black text-sky-700 text-base">{order.code}</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        order.artApprovalStatus === "approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : order.artApprovalStatus === "changes_requested"
                          ? "bg-red-50 text-red-800 border-red-300"
                          : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                      }`}
                    >
                      {order.artApprovalStatus === "approved"
                        ? "✓ ARTE APROVADA"
                        : order.artApprovalStatus === "changes_requested"
                        ? "✕ COM AJUSTES"
                        : "⏳ AGUARDANDO CLIENTE"}
                    </span>
                  </div>

                  {/* Customer Info Card */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{order.clientName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="font-medium truncate">{itemDesc}</span>
                      <span className="font-mono font-extrabold text-slate-800 shrink-0">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Artwork Image Box */}
                  <div className="bg-slate-100 p-2.5 rounded-2xl border border-slate-200/80 text-center relative overflow-hidden group">
                    <img
                      src={
                        order.artMockupUrl ||
                        "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80"
                      }
                      alt="Arte Prova Visual"
                      className="h-40 mx-auto rounded-xl object-contain shadow-2xs group-hover:scale-105 transition-transform"
                    />
                    <p className="text-[10px] text-slate-500 mt-2 italic font-medium">
                      {order.artNotes || "Validação de gabarito e perfil de cores CMYK."}
                    </p>
                  </div>

                  {/* Designer Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block">
                      DESIGNER RESPONSÁVEL DO PROJETO:
                    </label>
                    <select
                      value={currentDesigner}
                      onChange={(e) =>
                        setDesignerMap((prev) => ({ ...prev, [order.id]: e.target.value }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 text-xs outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Tiago Souza (Designer)">Tiago Souza (Designer Sênior)</option>
                      <option value="Lucas Oliveira (Designer)">Lucas Oliveira (Arte Finalista)</option>
                      <option value="Mariana Costa (Designer)">Mariana Costa (Comunicação Visual)</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                  <button
                    onClick={() => handleCopyDesignerSummary(order)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === order.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Ficha Copiada para o WhatsApp!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copiar Ficha p/ Designer (WhatsApp)</span>
                      </>
                    )}
                  </button>

                  <a
                    href={directApprovalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Abrir Portal do Cliente ({order.code})</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
