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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setTotalStats] = useState({
    totalBalance: 8327.0,
    activeOrders: 12,
    artPending: 3,
    pdvToday: 1250.0,
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <span className="bg-sky-500/20 text-sky-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-sky-500/30 uppercase tracking-wider">
              SISTEMA ERP CRM & PRECIFICAÇÃO GRÁFICA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Painel Operacional & Vendas</h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Gráfica Rápida, Papelaria Personalizada & Comunicação Visual. Operador: <strong>Tiago Souza</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 z-10">
            <a
              href="/pdv"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" /> Abrir Caixa PDV
            </a>
            <a
              href="/financeiro"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" /> Financeiro
            </a>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/financeiro"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">SALDO EM CONTAS</span>
              <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-800">{formatCurrency(stats.totalBalance)}</div>
            <span className="text-[10px] text-emerald-600 font-semibold block">Caixa Loja + Banco Inter + InfinitePay</span>
          </a>

          <a
            href="/kanban"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">PEDIDOS EM PRODUÇÃO</span>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Kanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-800">{stats.activeOrders} Pedidos</div>
            <span className="text-[10px] text-purple-600 font-semibold block">Em Fila de Impressão e Acabamento</span>
          </a>

          <a
            href="/aprovar-arte"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">ARTES EM APROVAÇÃO</span>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Palette className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-800">{stats.artPending} Provas Digitais</div>
            <span className="text-[10px] text-amber-600 font-semibold block">Aguardando Validação do Cliente</span>
          </a>

          <a
            href="/pdv"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">VENDAS HOJE (PDV)</span>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-emerald-600">{formatCurrency(stats.pdvToday)}</div>
            <span className="text-[10px] text-slate-400 font-semibold block">Dinheiro, Pix e InfinitePay</span>
          </a>
        </div>

        {/* Quick Shortcut Modules Grid */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-800 text-sm">Módulos Principais do Sistema</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/financeiro"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-sky-600">Financeiro Completo</h3>
                  <p className="text-xs text-slate-500">Fluxo de Caixa, DRE, Tesouraria e Inadimplência</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600" />
            </a>

            <a
              href="/kanban"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                  <Kanban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-sky-600">Kanban de Produção</h3>
                  <p className="text-xs text-slate-500">Fluxo de Impressão & Acabamento</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600" />
            </a>

            <a
              href="/impressoras"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-sky-600">Impressoras & Máquinas</h3>
                  <p className="text-xs text-slate-500">Laser, Jato de Tinta, Sublimação e Térmica</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600" />
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
