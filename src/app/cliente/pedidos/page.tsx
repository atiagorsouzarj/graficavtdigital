"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Package,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  Palette,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface Client { id: string; name: string; email: string; }
interface Order {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  artApprovalStatus: string;
  createdAt: string;
  shippingTrackingCode?: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-slate-100 text-slate-700", icon: Clock },
  sent: { label: "Enviado", color: "bg-sky-100 text-sky-800", icon: Package },
  art_approval: { label: "Aguardando sua aprovação", color: "bg-amber-100 text-amber-800", icon: Palette },
  art_pending: { label: "Ajuste pelo designer", color: "bg-orange-100 text-orange-800", icon: Palette },
  production_ready: { label: "Pronto p/ produção", color: "bg-indigo-100 text-indigo-800", icon: Package },
  in_printing: { label: "Em impressão", color: "bg-purple-100 text-purple-800", icon: Package },
  finishing: { label: "Em acabamento", color: "bg-cyan-100 text-cyan-800", icon: Package },
  ready_for_pickup: { label: "Pronto p/ retirada", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  completed: { label: "Concluído", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function ClientePedidosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "paid" | "pending_art">("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/cliente/me").then((r) => r.json()),
      fetch("/api/cliente/pedidos").then((r) => r.json()),
    ])
      .then(([me, myOrders]) => {
        if (me.error) {
          router.push("/cliente/login?redirect=/cliente/pedidos");
          return;
        }
        setClient(me);
        setOrders(Array.isArray(myOrders) ? myOrders : []);
        setLoading(false);
      })
      .catch(() => router.push("/cliente/login"));
  }, [router]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  const filtered = orders.filter((o) => {
    if (search && !o.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "open") return !["completed", "cancelled"].includes(o.status);
    if (filter === "paid") return o.paymentStatus === "paid";
    if (filter === "pending_art") return o.artApprovalStatus === "pending" || o.status === "art_approval";
    return true;
  });

  return (
    <ClientAreaLayout clientName={client.name}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Meus Pedidos</h1>
          <p className="text-xs text-slate-500">Acompanhe cada pedido, do rascunho à entrega.</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 font-bold">
            {[
              { id: "all", label: "Todos" },
              { id: "open", label: "Em Aberto" },
              { id: "pending_art", label: "Aprovação" },
              { id: "paid", label: "Pagos" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  filter === t.id ? "bg-sky-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhum pedido encontrado.</p>
            <p className="text-xs text-slate-500 mt-1">
              Quando você fizer um pedido, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {filtered.map((o) => {
                const st = STATUS_LABEL[o.status] || STATUS_LABEL.draft;
                const Icon = st.icon;
                return (
                  <Link
                    key={o.id}
                    href={`/cliente/pedidos/${o.id}`}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${st.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono font-black text-sky-700">{o.code}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {formatDateOnly(o.createdAt)}
                        </div>
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block mt-1 ${st.color}`}>
                          {st.label}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-800 font-mono">
                        {formatCurrency(o.totalAmount)}
                      </div>
                      <div
                        className={`text-[10px] font-bold mt-0.5 ${
                          o.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {o.paymentStatus === "paid" ? "✓ PAGO" : "⏳ PENDENTE"}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ClientAreaLayout>
  );
}
