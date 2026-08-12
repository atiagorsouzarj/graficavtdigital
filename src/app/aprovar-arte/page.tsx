"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Palette, ExternalLink, CheckCircle2, AlertCircle, Clock, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  code: string;
  clientName: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  totalAmount: string;
}

export default function ArtApprovalIndexPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            PORTAL DE PROVAS DIGITAIS
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Área de Aprovação de Arte</h1>
          <p className="text-xs text-slate-500">
            Gerencie os links de prova enviados aos clientes e acompanhe autorizações de impressão.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono font-extrabold text-sky-700 text-sm">{order.code}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.artApprovalStatus === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.artApprovalStatus === "changes_requested"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.artApprovalStatus === "approved"
                    ? "✓ APROVADA"
                    : order.artApprovalStatus === "changes_requested"
                    ? "✕ COM AJUSTES"
                    : "AGUARDANDO APROVAÇÃO"}
                </span>
              </div>

              <div>
                <p className="font-bold text-slate-800 text-sm">{order.clientName}</p>
                <p className="text-slate-500 text-xs mt-0.5">{order.artNotes || "Validação de layout e CMYK."}</p>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                <img
                  src={order.artMockupUrl || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80"}
                  alt="Arte Preview"
                  className="h-36 mx-auto rounded-lg object-contain"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-slate-800">{formatCurrency(order.totalAmount)}</span>

                <a
                  href={`/aprovar-arte/${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Portal Cliente
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
