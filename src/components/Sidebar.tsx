"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  Palette,
  DollarSign,
  ShoppingCart,
  FileSpreadsheet,
  Users,
  Printer,
  Package,
  Calculator,
  Truck,
  MessageSquare,
  Mail,
  Settings,
  Code,
  Sparkles,
  Globe,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuGroups: MenuGroup[] = [
    {
      group: "CRM & VENDAS",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Portal do Cliente (Público)", href: "/portal", icon: Globe, badge: "Público", highlight: true },
        { name: "CRM - Gestão de Clientes", href: "/clientes", icon: Users, badge: "CRM" },
        { name: "Orçamentos & Pedidos", href: "/orcamentos", icon: FileSpreadsheet },
        { name: "Kanban de Produção", href: "/kanban", icon: Kanban, badge: "Live" },
        { name: "Aprovação de Arte", href: "/aprovar-arte", icon: Palette },
        { name: "PDV / Caixa Balcão", href: "/pdv", icon: ShoppingCart },
      ],
    },
    {
      group: "FINANCEIRO & LOGÍSTICA",
      items: [
        { name: "Financeiro", href: "/financeiro", icon: DollarSign, highlight: true },
        { name: "Logística SuperFrete", href: "/logistica", icon: Truck },
      ],
    },
    {
      group: "PRECIFICAÇÃO & ESTOQUE",
      items: [
        { name: "Impressoras", href: "/impressoras", icon: Printer },
        { name: "Materiais e Insumos", href: "/materiais", icon: Package },
        { name: "Produtos & Formação Preço", href: "/produtos", icon: Calculator },
      ],
    },
    {
      group: "COMUNICAÇÃO & API",
      items: [
        { name: "WhatsApp & Bot Baileys", href: "/whatsapp", icon: MessageSquare },
        { name: "E-mail Transacional", href: "/email-templates", icon: Mail },
        { name: "Painel de Controle", href: "/configuracoes", icon: Settings },
        { name: "API Externa & VoIP", href: "/api-externa", icon: Code },
      ],
    },
  ];

  // Em mobile (lg < 1024px): drawer com overlay
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40"
            aria-hidden="true"
          />
        )}
        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <aside className="w-64 bg-slate-900 text-slate-300 h-full flex flex-col shadow-2xl relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg z-10"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-wide">GRÁFICA & PAPELARIA</h1>
                <p className="text-[10px] text-sky-400 font-medium">ERP CRM & Precificação</p>
              </div>
            </div>

            <div className="flex-1 py-3 px-3 overflow-y-auto space-y-5 text-xs">
              {menuGroups.map((group, idx) => (
                <div key={idx}>
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider px-2 block mb-1.5 uppercase">
                    {group.group}
                  </span>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-all ${
                            isActive
                              ? "bg-sky-600 text-white font-semibold shadow-xs"
                              : item.highlight
                              ? "text-sky-300 hover:bg-slate-800/90 hover:text-white"
                              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="bg-sky-500/20 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-sky-500/30">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 bg-slate-950/40 space-y-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Servidor Debian
                </span>
                <span className="text-emerald-400 font-mono font-bold">100% OK</span>
              </div>
              <div className="text-slate-500">PostgreSQL + Drizzle ORM</div>
            </div>
          </aside>
        </div>
      </>
    );
  }

  // Desktop (>= 1024px): sidebar fixa normal
  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-57px)] transition-all">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-white tracking-wide">GRÁFICA & PAPELARIA</h1>
          <p className="text-[10px] text-sky-400 font-medium">ERP CRM & Precificação</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-3 overflow-y-auto space-y-5 text-xs">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider px-2 block mb-1.5 uppercase">
              {group.group}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-sky-600 text-white font-semibold shadow-xs"
                        : item.highlight
                        ? "text-sky-300 hover:bg-slate-800/90 hover:text-white"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-sky-500/20 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-sky-500/30">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 bg-slate-950/40 space-y-1">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Servidor Debian
          </span>
          <span className="text-emerald-400 font-mono font-bold">100% OK</span>
        </div>
        <div className="text-slate-500">PostgreSQL + Drizzle ORM</div>
      </div>
    </aside>
  );
}
