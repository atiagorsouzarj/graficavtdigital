"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Palette,
  ArrowRight,
  AlertCircle,
  Package,
  CreditCard,
  Printer,
  FileText,
  MessageCircle,
  Download,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";
import OrderJourneyStepper from "@/components/OrderJourneyStepper";
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
  const artPending = orders.filter((o) => o.status === "art_approval");
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((acc, o) => acc + parseFloat(o.totalAmount || "0"), 0);

  const firstName = client.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <ClientAreaLayout clientName={client.name}>
      <div className="space-y-6">
        {/* Hero de boas-vindas */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-sky-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          {/* decoração */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-24 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Área exclusiva do cliente
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-sky-200/90 text-sm mt-1 max-w-lg">
              Acompanhe seus pedidos em tempo real, aprove artes e gerencie seus pagamentos em um só lugar.
            </p>
          </div>
        </div>

        {/* Alerta de arte pendente — prioridade máxima */}
        {artPending.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200 animate-pulse">
              <Palette className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-amber-900">
                {artPending.length === 1
                  ? `A arte do pedido ${artPending[0].code} está esperando por você!`
                  : `${artPending.length} artes aguardando sua aprovação`}
              </h3>
              <p className="text-xs text-amber-800/80 mt-0.5">
                A produção só começa após a sua aprovação. Leva menos de 1 minuto.
              </p>
            </div>
            <Link
              href={`/cliente/arte/${artPending[0].id}`}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 transition-all hover:scale-105"
            >
              <Palette className="w-4 h-4" /> Aprovar Agora
            </Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Em Produção", value: String(pending.length), icon: Clock, accent: "text-amber-600 bg-amber-50 border-amber-100" },
            { label: "Concluídos", value: String(completed.length), icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            { label: "A Pagar", value: String(unpaid.length), icon: CreditCard, accent: "text-red-500 bg-red-50 border-red-100" },
            { label: "Total Investido", value: formatCurrency(totalSpent.toFixed(2)), icon: TrendingUp, accent: "text-sky-600 bg-sky-50 border-sky-100" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div
                key={i}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${kpi.accent}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{kpi.value}</div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mt-1.5">{kpi.label}</div>
              </div>
            );
          })}
        </div>

        {/* Pedido em andamento — jornada do orçamento à entrega */}
        {pending.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider block">
                  Pedido em andamento
                </span>
                <span className="font-mono font-black text-lg text-slate-800">{pending[0].code}</span>
              </div>
              <Link
                href={`/cliente/pedidos/${pending[0].id}`}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
              >
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <OrderJourneyStepper order={pending[0]} />
          </div>
        )}

        {/* Grid: pedidos + ações rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Pedidos recentes */}
          <div className="lg:col-span-2">
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
                <p className="text-xs text-slate-500 mt-1">Solicite um orçamento pelo portal ou WhatsApp.</p>
                <a
                  href="https://wa.me/5521978869414?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Pedir orçamento
                </a>
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
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all block shadow-xs group"
                    >
                      <div className="flex items-center justify-between gap-3">
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
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <div className="mt-3">
                        <OrderJourneyStepper order={o} compact />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="space-y-3">
            <h2 className="text-lg font-black text-slate-800">Ações rápidas</h2>

            <a
              href="https://wa.me/5521978869414?text=Olá!%20Gostaria%20de%20solicitar%20um%20novo%20orçamento"
              target="_blank"
              rel="noreferrer"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl p-4 flex items-center gap-3 text-white shadow-md hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black">Novo Orçamento</div>
                <div className="text-[10px] text-emerald-100">Fale conosco pelo WhatsApp</div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <Link
              href="/cliente/gabaritos"
              className="bg-white hover:bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-800">Gabaritos</div>
                <div className="text-[10px] text-slate-500">Modelos prontos para sua arte</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-sky-500 transition-all" />
            </Link>

            <Link
              href="/cliente/dados"
              className="bg-white hover:bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-800">Meus Dados</div>
                <div className="text-[10px] text-slate-500">Endereço, contato e documentos</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-sky-500 transition-all" />
            </Link>

            {/* Card de suporte */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-wide text-sky-300">Suporte</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Dúvidas sobre seu pedido, prazos ou arquivos? Nossa equipe responde rapidinho no WhatsApp.
              </p>
              <a
                href="https://wa.me/5521978869414"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
              >
                Falar com atendente <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ClientAreaLayout>
  );
}
