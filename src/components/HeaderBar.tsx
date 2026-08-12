"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  ExternalLink,
  Bell,
  Headphones,
  LogOut,
  Menu,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  User,
  Package,
  Printer,
  ShoppingBag,
} from "lucide-react";
import QuickQuoteModal from "./QuickQuoteModal";
import PublicLinksModal from "./PublicLinksModal";
import VoipPopupModal from "./VoipPopupModal";

interface HeaderBarProps {
  onToggleSidebar?: () => void;
}

export default function HeaderBar({ onToggleSidebar }: HeaderBarProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showVoipModal, setShowVoipModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    orders: Array<{ id: string; code: string; clientName: string; totalAmount: string }>;
    clients: Array<{ id: string; name: string; document: string }>;
    products: Array<{ id: string; name: string; suggestedPrice: string }>;
  }>({ orders: [], clients: [], products: [] });
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ orders: [], clients: [], products: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [resOrders, resClients, resProds] = await Promise.all([
          fetch(`/api/orders?q=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/clients?q=${encodeURIComponent(searchQuery)}`),
          fetch("/api/products"),
        ]);
        const ordersData = await resOrders.json();
        const clientsData = await resClients.json();
        const prodsData = await resProds.json();

        const filteredProds = Array.isArray(prodsData)
          ? prodsData.filter(
              (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : [];

        setSearchResults({
          orders: Array.isArray(ordersData) ? ordersData.slice(0, 4) : [],
          clients: Array.isArray(clientsData) ? clientsData.slice(0, 4) : [],
          products: filteredProds.slice(0, 4),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const notifications = [
    { id: 1, title: "Arte Aprovada!", text: "Studio Design aprovou a prova do pedido PV-0000101.", time: "Há 10 min", type: "success" },
    { id: 2, title: "Novo Pagamento Pix", text: "Recebido R$ 91,50 ref. ao pedido PV-7716919.", time: "Há 25 min", type: "success" },
    { id: 3, title: "Alerta de Estoque", text: "Papel Couché 300g está abaixo de 200 folhas.", time: "Há 1 hora", type: "warning" },
    { id: 4, title: "Cotação SuperFrete", text: "Adesivo Vinil recalculado via SEDEX Express.", time: "Há 2 horas", type: "info" },
    { id: 5, title: "Chamada Telefônica", text: "Cliente Lucas Mendes ligando via VoIP.", time: "Há 3 horas", type: "voip" },
    { id: 6, title: "WhatsApp Bot", text: "Aguardando resposta do cliente no fluxo de arte.", time: "Há 4 horas", type: "info" },
    { id: 7, title: "InfinitePay Link", text: "Link de pagamento enviado para Restaurante Sabor & Arte.", time: "Há 5 horas", type: "success" },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        {/* Left section: Hamburger & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar matching photo 02 */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedidos, clientes, produtos, materiais..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-12 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200/60 border border-slate-300 text-slate-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <span>⌘</span>K
              </kbd>
            )}

            {/* Global Search Popover */}
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 space-y-3 max-h-96 overflow-y-auto text-xs animate-in fade-in duration-150">
                {isSearching ? (
                  <p className="text-slate-400 text-center py-4 italic">Buscando no banco de dados...</p>
                ) : (
                  <>
                    {/* Orders */}
                    {searchResults.orders.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Pedidos & Orçamentos
                        </span>
                        {searchResults.orders.map((o) => (
                          <a
                            key={o.id}
                            href="/orcamentos"
                            onClick={() => setSearchQuery("")}
                            className="p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium block"
                          >
                            <span className="font-mono font-bold text-sky-700">{o.code} — {o.clientName}</span>
                            <span className="text-slate-500 font-bold">R$ {parseFloat(o.totalAmount).toFixed(2)}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Clients */}
                    {searchResults.clients.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Clientes
                        </span>
                        {searchResults.clients.map((c) => (
                          <a
                            key={c.id}
                            href="/clientes"
                            onClick={() => setSearchQuery("")}
                            className="p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium block"
                          >
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{c.document}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Produtos
                        </span>
                        {searchResults.products.map((p) => (
                          <a
                            key={p.id}
                            href="/produtos"
                            onClick={() => setSearchQuery("")}
                            className="p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium block"
                          >
                            <span className="font-bold text-slate-800">{p.name}</span>
                            <span className="text-emerald-600 font-extrabold">R$ {parseFloat(p.suggestedPrice).toFixed(2)}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {searchResults.orders.length === 0 &&
                      searchResults.clients.length === 0 &&
                      searchResults.products.length === 0 && (
                        <p className="text-slate-400 text-center py-4 italic">Nenhum resultado encontrado para "{searchQuery}".</p>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Action Buttons, Bell, Support, Operator Profile */}
        <div className="flex items-center gap-2.5">
          {/* VoIP Call Trigger Test */}
          <button
            onClick={() => setShowVoipModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
            title="Simular Chamada VoIP Entrante"
          >
            <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
            <span>VoIP</span>
          </button>

          {/* Cadastro Público Link Button */}
          <button
            onClick={() => setShowPublicModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Cadastro público</span>
          </button>

          {/* Novo Orçamento Primary Button */}
          <button
            onClick={() => setShowQuoteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo orçamento</span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Bell Icon with Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                7
              </span>
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-semibold text-slate-800">Notificações em Tempo Real</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">7 novas</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex gap-3 text-xs">
                      {n.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      {n.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {n.type === "voip" && <PhoneCall className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />}
                      {n.type === "info" && <FileText className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-600 mt-0.5">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-sky-600 font-medium hover:underline cursor-pointer"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Support Headset Icon */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Suporte Técnico e Ajuda"
          >
            <Headphones className="w-5 h-5" />
          </button>

          {/* User Profile Avatar & Role */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              TS
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-800">Tiago Souza</div>
              <div className="text-[10px] text-slate-500">Admin</div>
            </div>
            <button
              onClick={() => alert("Sessão encerrada com segurança.")}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Central de Suporte</h3>
                <p className="text-xs text-slate-500">Suporte Técnico Gráfica & Papelaria</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Precisa de ajuda com impressoras, gabaritos de corte, taxas de cartão ou integrações?
            </p>
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp Suporte:</span>
                <span className="font-semibold text-slate-800">+55 (11) 98877-6655</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servidor SSH Debian:</span>
                <span className="font-semibold text-emerald-600">Conectado (4 Cores / 12GB RAM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Versão do Sistema:</span>
                <span className="font-semibold text-slate-800">v2.5.0 (Enterprise)</span>
              </div>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full mt-5 bg-sky-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-sky-700 cursor-pointer"
            >
              Fechar Suporte
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showQuoteModal && <QuickQuoteModal onClose={() => setShowQuoteModal(false)} />}
      {showPublicModal && <PublicLinksModal onClose={() => setShowPublicModal(false)} />}
      {showVoipModal && <VoipPopupModal onClose={() => setShowVoipModal(false)} />}
    </>
  );
}
