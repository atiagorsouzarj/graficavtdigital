"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Package,
  Truck,
  Palette,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface Client { id: string; name: string; email: string; }
interface OrderDetail {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingTrackingCode?: string;
  shippingAddress?: string;
  artApprovalStatus: string;
  artMockupUrl?: string;
  artNotes?: string;
  artRejectionReason?: string;
  totalAmount: string;
  subtotalAmount?: string;
  discountAmount?: string;
  freightAmount?: string;
  createdAt: string;
  items?: Array<{ productName: string; quantity: number; unitPrice: string; totalPrice: string }>;
}

const TIMELINE = [
  { key: "draft", label: "1. Pedido criado" },
  { key: "sent", label: "2. Orçamento enviado" },
  { key: "art_approval", label: "3. Arte aprovada por você" },
  { key: "paid", label: "4. Pagamento confirmado" },
  { key: "in_printing", label: "5. Em produção" },
  { key: "ready_for_pickup", label: "6. Pronto p/ retirada / envio" },
  { key: "completed", label: "7. Concluído" },
];

export default function ClientePedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch("/api/cliente/me").then((r) => r.json()),
      fetch(`/api/cliente/pedidos/${id}`).then((r) => r.json()),
    ])
      .then(([me, orderData]) => {
        if (me.error) {
          router.push(`/cliente/login?redirect=/cliente/pedidos/${id}`);
          return;
        }
        setClient(me);
        if (orderData.error) {
          setNotFound(true);
        } else {
          setOrder(orderData);
        }
        setLoading(false);
      })
      .catch(() => setNotFound(true));
  }, [id, router]);

  const isStageDone = (stage: string) => {
    if (!order) return false;
    if (stage === "paid") return order.paymentStatus === "paid";
    const done = ["art_approval", "production_ready", "in_printing", "finishing", "ready_for_pickup", "completed"];
    if (stage === "art_approval") return done.includes(order.status) || order.artApprovalStatus === "approved";
    if (stage === "in_printing") return ["in_printing", "finishing", "ready_for_pickup", "completed"].includes(order.status);
    if (stage === "ready_for_pickup") return ["ready_for_pickup", "completed"].includes(order.status);
    if (stage === "completed") return order.status === "completed";
    return ["sent", "art_approval", "art_pending", "production_ready", "in_printing", "finishing", "ready_for_pickup", "completed"].includes(order.status);
  };

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <ClientAreaLayout clientName={client.name}>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-lg font-black text-slate-800">Pedido não encontrado</h1>
          <p className="text-xs text-slate-500 mt-1">
            Este pedido não existe ou não pertence à sua conta.
          </p>
          <Link
            href="/cliente/pedidos"
            className="inline-block mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
          >
            Ver meus pedidos
          </Link>
        </div>
      </ClientAreaLayout>
    );
  }

  if (!order) return null;

  const canApproveArt = order.artApprovalStatus === "pending" || order.status === "art_approval";

  return (
    <ClientAreaLayout clientName={client.name}>
      <div className="space-y-5">
        <Link
          href="/cliente/pedidos"
          className="text-xs text-slate-500 hover:text-sky-600 font-bold flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar para meus pedidos
        </Link>

        {/* Cabeçalho do pedido */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                CÓDIGO DO PEDIDO
              </span>
              <span className="font-mono font-black text-2xl text-sky-700">{order.code}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total</span>
              <span className="text-2xl font-black text-slate-800 font-mono">
                {formatCurrency(order.totalAmount)}
              </span>
              <div
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus === "paid" ? "✓ PAGO" : "⏳ PAGAMENTO PENDENTE"}
              </div>
            </div>
          </div>
        </div>

        {/* Aviso para aprovar arte */}
        {canApproveArt && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <Palette className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-black text-amber-900">Arte aguardando sua aprovação</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                A equipe de design finalizou a arte. Aprove ou solicite ajustes para liberar a produção.
              </p>
              <Link
                href={`/cliente/arte/${order.id}`}
                className="inline-block mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Palette className="w-3.5 h-3.5" /> Avaliar Arte Agora
              </Link>
            </div>
          </div>
        )}

        {/* Linha do tempo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-3">
            Linha do tempo
          </h3>
          <div className="space-y-2">
            {TIMELINE.map((stage, idx) => {
              const done = isStageDone(stage.key);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    done
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        done ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"
                      }`}
                    >
                      {done ? "✓" : idx + 1}
                    </div>
                    <span className="font-bold text-xs">{stage.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${done ? "text-emerald-600" : "text-slate-400"}`}>
                    {done ? "Concluído" : "Aguardando"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rastreamento */}
        {order.shippingTrackingCode && (
          <div className="bg-sky-50 border border-sky-300 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-sky-700 uppercase block">
                Código de Rastreio
              </span>
              <span className="font-mono font-extrabold text-base text-sky-900">
                {order.shippingTrackingCode}
              </span>
            </div>
            <a
              href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.shippingTrackingCode}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
            >
              Rastrear <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Itens */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-600" /> Itens do pedido
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{it.productName}</div>
                    <div className="text-[10px] text-slate-500">Qtd: {it.quantity}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-800">
                    {formatCurrency(it.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-xs">
              {order.subtotalAmount && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(order.subtotalAmount)}</span>
                </div>
              )}
              {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto</span>
                  <span className="font-mono">- {formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              {order.freightAmount && parseFloat(order.freightAmount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Frete</span>
                  <span className="font-mono">+ {formatCurrency(order.freightAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black border-t border-slate-200 pt-1.5 mt-1.5">
                <span>TOTAL</span>
                <span className="text-sky-700 font-mono">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ajuda */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-800">Precisa de ajuda com este pedido?</p>
            <p className="text-[10px] text-slate-500">Fale com a gráfica pelo WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/5521978869414?text=Olá,%20preciso%20de%20ajuda%20com%20meu%20pedido"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
          >
            WhatsApp <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </ClientAreaLayout>
  );
}
