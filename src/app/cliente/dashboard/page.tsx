"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Palette,
  ArrowRight,
  AlertCircle,
  Package,
  CreditCard,
  Printer,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  artApprovalStatus: string;
  shippingTrackingCode?: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-slate-100 text-slate-700", icon: Clock },
  sent: { label: "Enviado", color: "bg-sky-100 text-sky-800", icon: Package },
  art_approval: { label: "Aguardando sua aprovação de arte", color: "bg-amber-100 text-amber-800", icon: Palette },
  art_pending: { label: "Aguardando ajuste do designer", color: "bg-orange-100 text-orange-800", icon: Palette },
  production_ready: { label: "Pronto para produção", color: "bg-indigo-100 text-indigo-800", icon: Package },
  in_printing: { label: "Em impressão", color: "bg-purple-100 text-purple-800", icon: Printer },
  finishing: { label: "Em acabamento", color: "bg-cyan-100 text-cyan-800", icon: Package },
  ready_for_pickup: { label: "Pronto para retirada", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  completed: { label: "Concluído", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/cliente/me").then((r) => r.json()),
      fetch("/api/cliente/pedidos").then((r) => r.json()),
    ])
      .then(([me, myOrders]) => {
        if (me.error) {
          router.push("/cliente/login?redirect=/cliente/dashboard");
          return;
        }
        setClient(me);
        setOrders(Array.isArray(myOrders) ? myOrders : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        router.push("/cliente/login");
      });
  }, [router]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  const pending = orders.filter((o) =>
    ["art_approval", "art_pending", "production_ready", "in_printing", "finishing", "ready_for_pickup"].includes(o.status)
  );
  const completed = orders.filter((o) => o.status === "completed");
  const unpaid = orders.filter((o) => o.paymentStatus !== "paid" && o.status !== "cancelled");
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((acc, o) => acc + parseFloat(o.totalAmount || "0"), 0);

  return (
    <ClientAreaLayout clientName={client.name}>
      <div className="space-y-6">
        {/* Boas-vindas */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-black">Olá, {client.name.split(" ")[0]}! 👋</h1>
          <p className="text-sky-100 text-sm mt-1">
            Acompanhe seus pedidos, aprove artes e gerencie seus pagamentos em um só lugar.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase">
              <Clock className="w-3.5 h-3.5" /> Em Aberto
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">{pending.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluídos
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">{completed.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase">
              <CreditCard className="w-3.5 h-3.5" /> A Pagar
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">{unpaid.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-sky-600 font-bold text-[10px] uppercase">
              <ShoppingBag className="w-3.5 h-3.5" /> Total Gasto
            </div>
            <div className="text-base font-black text-slate-800 mt-1">{formatCurrency(totalSpent.toFixed(2))}</div>
          </div>
        </div>

        {/* Pedidos recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-slate-800">Seus pedidos</h2>
            <Link
              href="/cliente/pedidos"
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Você ainda não tem pedidos.</p>
              <p className="text-xs text-slate-500 mt-1">Solicite um orçamento pelo portal.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => {
                const st = STATUS_LABEL[o.status] || STATUS_LABEL.draft;
                const Icon = st.icon;
                return (
                  <Link
                    key={o.id}
                    href={`/cliente/pedidos/${o.id}`}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono font-black text-sky-700 text-sm">{o.code}</div>
                        <div className="text-[10px] text-slate-500">{formatDateOnly(o.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-800">{formatCurrency(o.totalAmount)}</div>
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block mt-1 ${st.color}`}>
                        {st.label}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ClientAreaLayout>
  );
}
