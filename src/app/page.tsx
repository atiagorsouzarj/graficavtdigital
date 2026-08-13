"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  LayoutDashboard,
  DollarSign,
  Kanban,
  ShoppingCart,
  Palette,
  Users,
  Printer,
  Package,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Share2,
  Sparkles,
  BarChart2,
  PieChart,
  Zap,
  Globe,
  Clock,
  CheckCircle2,
  MessageSquare,
  Truck,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setTotalStats] = useState({
    totalBalance: 8327.0,
    activeOrders: 12,
    artPending: 3,
    pdvToday: 1250.0,
    averageMargin: 58.4,
  });

  const [topProducts] = useState([
    { name: "Cartão de Visita Couchê 300g Verniz", sales: 142, revenue: "R$ 13.490,00" },
    { name: "Banner Lona 440g (Comunicação Visual m²)", sales: 88, revenue: "R$ 8.620,00" },
    { name: "Adesivo Vinil Brilho Recorte Especial", sales: 64, revenue: "R$ 5.120,00" },
    { name: "Adesivo DTF UV Personalizado A3", sales: 51, revenue: "R$ 4.029,00" },
    { name: "Caneca de Cerâmica Sublimação 325ml", sales: 39, revenue: "R$ 1.560,00" },
  ]);

  const [recentOrders, setRecentOrders] = useState([
    { code: "PV-000102", client: "Studio Design Ltda (PJ)", status: "Em Impressão", total: "R$ 1.840,00", time: "10 min atrás" },
    { code: "CUP-003798", client: "Raphaela Pinheiro", status: "Pronto p/ Retirada", total: "R$ 17,17", time: "25 min atrás" },
    { code: "ORC-00982", client: "Gráfica VT Digital (Atacado)", status: "Arte em Aprovação", total: "R$ 4.500,00", time: "1 hora atrás" },
    { code: "PV-000101", client: "Farmácia Centro", status: "Acabamento & Corte", total: "R$ 890,00", time: "2 horas atrás" },
  ]);

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Top Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10">
            <span className="bg-sky-500/20 text-sky-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-sky-500/30 uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Dashboard de Vendas & Operações
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Dashboard Operacional</h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Gráfica Rápida, Papelaria Personalizada, DTF & Comunicação Visual. Operador: <strong>Tiago Souza</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 z-10">
            <a
              href="/portal"
              target="_blank"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-sky-400" /> Portal do Cliente
            </a>

            <a
              href="/pdv"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" /> Caixa PDV [F9]
            </a>

            <a
              href="/orcamentos"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Orçamento
            </a>
          </div>
        </div>

        {/* 5 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <a
            href="/financeiro"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">SALDO EM CONTAS</span>
              <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-800">{formatCurrency(stats.totalBalance)}</div>
            <span className="text-[10px] text-emerald-600 font-bold block">Caixa + Inter + InfinitePay</span>
          </a>

          <a
            href="/pdv"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">VENDAS HOJE (PDV)</span>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600">{formatCurrency(stats.pdvToday)}</div>
            <span className="text-[10px] text-slate-500 font-semibold block">Dinheiro, Pix e Cartão</span>
          </a>

          <a
            href="/kanban"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">PEDIDOS EM PRODUÇÃO</span>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Kanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-800">{stats.activeOrders} Pedidos</div>
            <span className="text-[10px] text-purple-600 font-bold block">Em Impressão e Corte</span>
          </a>

          <a
            href="/aprovar-arte"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">ARTES EM APROVAÇÃO</span>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Palette className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-800">{stats.artPending} Provas Digitais</div>
            <span className="text-[10px] text-amber-600 font-bold block">Validação do Cliente</span>
          </a>

          <a
            href="/produtos"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">MARGEM MÉDIA REAL</span>
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-indigo-700">{stats.averageMargin}%</div>
            <span className="text-[10px] text-slate-500 font-semibold block">Lucro Real Líquido</span>
          </a>
        </div>

        {/* 2-Column Section: Top Selling Items + Live Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Top Selling Products List */}
          <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Produtos Mais Vendidos (Top Items)</h3>
              </div>
              <a href="/produtos" className="text-xs font-extrabold text-sky-600 hover:underline flex items-center gap-1">
                Ver Catálogo Completo <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs shrink-0 font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-800 line-clamp-1">{p.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{p.sales} vendas este mês</span>
                    </div>
                  </div>

                  <span className="font-mono font-black text-slate-900 shrink-0">{p.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Recent Orders Stream */}
          <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Últimos Pedidos em Andamento</h3>
              </div>
              <a href="/kanban" className="text-xs font-extrabold text-purple-600 hover:underline flex items-center gap-1">
                Ver Kanban <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              {recentOrders.map((o, idx) => (
                <div key={idx} className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sky-700 text-xs">{o.code}</span>
                      <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {o.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-xs">{o.client}</p>
                    <span className="text-[10px] text-slate-400 block">{o.time}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 text-xs block">{o.total}</span>
                    <a
                      href={`/aprovar-arte/${o.code}`}
                      className="text-[10px] font-bold text-sky-600 hover:underline inline-block mt-1"
                    >
                      Abrir Prova
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Shortcuts Modules Grid */}
        <div className="space-y-3">
          <h2 className="font-extrabold text-slate-800 text-sm">Módulos Principais do Sistema</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <a
              href="/whatsapp"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 group-hover:text-emerald-600">WhatsApp Live Chat</h3>
                  <p className="text-[11px] text-slate-500">Atendimento Omnichannel & Bot</p>
                </div>
              </div>
            </a>

            <a
              href="/clientes"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 group-hover:text-sky-600">CRM de Clientes</h3>
                  <p className="text-[11px] text-slate-500">Importação/Exportação CSV</p>
                </div>
              </div>
            </a>

            <a
              href="/financeiro"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 group-hover:text-purple-600">Financeiro & DRE</h3>
                  <p className="text-[11px] text-slate-500">Fluxo de Caixa e Relatórios</p>
                </div>
              </div>
            </a>

            <a
              href="/configuracoes"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 group-hover:text-amber-600">Painel de Controle</h3>
                  <p className="text-[11px] text-slate-500">Parâmetros, Redes & Backups</p>
                </div>
              </div>
            </a>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
