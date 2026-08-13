"use client";

import React from "react";
import {
  Printer,
  LogOut,
  User,
  LayoutDashboard,
  ShoppingBag,
  FileText,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface ClientAreaLayoutProps {
  clientName: string;
  children: React.ReactNode;
}

export default function ClientAreaLayout({ clientName, children }: ClientAreaLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("Sair da sua área de cliente?")) return;
    try {
      await fetch("/api/cliente/auth/logout", { method: "POST" });
      router.push("/cliente/login");
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { href: "/cliente/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cliente/pedidos", label: "Meus Pedidos", icon: ShoppingBag },
    { href: "/cliente/dados", label: "Meus Dados", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      {/* Header da Área do Cliente */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/cliente/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base tracking-wide bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                PrintFlow
              </span>
              <span className="text-[10px] font-bold text-sky-400 block tracking-widest uppercase">
                Área do Cliente
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    isActive
                      ? "bg-sky-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs">
              <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                {clientName.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <div className="font-bold text-white text-[11px]">{clientName}</div>
                <div className="text-[9px] text-slate-400">Cliente</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-3 py-2 border-t border-slate-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap ${
                  isActive ? "bg-sky-600 text-white" : "text-slate-300 bg-slate-800"
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} PrintFlow Gráfica Criativa</span>
          <Link href="/portal" className="hover:text-white">
            <ChevronLeft className="w-3 h-3 inline mr-1" />
            Voltar ao Portal Público
          </Link>
        </div>
      </footer>
    </div>
  );
}
