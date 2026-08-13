"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  Sparkles,
  UserPlus,
  Palette,
  Truck,
  Download,
  MessageSquare,
  ChevronRight,
  PhoneCall,
  Globe,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Share2,
  ExternalLink,
} from "lucide-react";

export default function PublicPortalPage() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [artCodeInput, setArtCodeInput] = useState("");
  const [trackCodeInput, setTrackCodeInput] = useState("");

  const [companySettings, setCompanySettings] = useState<Record<string, string>>({
    company_name: "VTDIGITAL ART STUDIO & GRÁFICA RÁPIDA",
    company_whatsapp: "(21) 97886-9414",
    social_instagram_url: "https://instagram.com/vtdigital.oficial",
    social_instagram_enabled: "true",
    social_whatsapp_url: "https://wa.me/5521978869414",
    social_whatsapp_enabled: "true",
    social_facebook_url: "https://facebook.com/graficavtdigital",
    social_facebook_enabled: "true",
    social_tiktok_url: "https://tiktok.com/@vtdigital.art",
    social_tiktok_enabled: "true",
    social_threads_url: "https://threads.net/@vtdigital.oficial",
    social_threads_enabled: "true",
  });

  const banners = [
    {
      badge: "Destaque da Semana",
      title: "Banner Lona 440g & Adesivos em Vinil HD",
      subtitle: "Comunicação visual com acabamento impecável, ilhós e alta durabilidade.",
      color: "from-sky-900 via-indigo-950 to-slate-900",
      cta: "Fazer Pedido",
      link: "/cadastro-publico",
    },
    {
      badge: "Inovação & Tecnologia",
      title: "Impressão Konica Minolta CMYK & DTF UV",
      subtitle: "Aprovação de arte 100% digital diretamente no seu celular ou computador.",
      color: "from-purple-900 via-slate-900 to-indigo-950",
      cta: "Aprovar Arte",
      link: "/aprovar-arte",
    },
    {
      badge: "Atendimento Corporativo",
      title: "Faturamento Faturado para Empresas (PJ)",
      subtitle: "Condições especiais, tabela de atacado e logística de entrega expressa.",
      color: "from-emerald-900 via-slate-900 to-sky-950",
      cta: "Cadastrar Empresa",
      link: "/cadastro-publico",
    },
  ];

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.map) setCompanySettings((prev) => ({ ...prev, ...d.map }));
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const socialItems = [
    {
      key: "instagram",
      name: "Instagram",
      url: companySettings.social_instagram_url || "https://instagram.com/vtdigital.oficial",
      customIcon: companySettings.social_instagram_icon_url,
      enabled: companySettings.social_instagram_enabled !== "false",
      bgGradient: "from-purple-600 via-pink-600 to-amber-500",
    },
    {
      key: "whatsapp",
      name: "WhatsApp Direct",
      url: companySettings.social_whatsapp_url || "https://wa.me/5521978869414",
      customIcon: companySettings.social_whatsapp_icon_url,
      enabled: companySettings.social_whatsapp_enabled !== "false",
      bgGradient: "from-emerald-500 to-teal-700",
    },
    {
      key: "facebook",
      name: "Facebook",
      url: companySettings.social_facebook_url || "https://facebook.com/graficavtdigital",
      customIcon: companySettings.social_facebook_icon_url,
      enabled: companySettings.social_facebook_enabled !== "false",
      bgGradient: "from-blue-600 to-indigo-800",
    },
    {
      key: "tiktok",
      name: "TikTok",
      url: companySettings.social_tiktok_url || "https://tiktok.com/@vtdigital.art",
      customIcon: companySettings.social_tiktok_icon_url,
      enabled: companySettings.social_tiktok_enabled !== "false",
      bgGradient: "from-slate-800 to-black",
    },
    {
      key: "threads",
      name: "Threads",
      url: companySettings.social_threads_url || "https://threads.net/@vtdigital.oficial",
      customIcon: companySettings.social_threads_icon_url,
      enabled: companySettings.social_threads_enabled !== "false",
      bgGradient: "from-slate-900 to-slate-950",
    },
  ].filter((s) => s.enabled);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                VTDIGITAL
              </span>
              <span className="text-[10px] font-bold text-sky-400 block tracking-widest uppercase">
                ART STUDIO & GRÁFICA RÁPIDA
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-300 font-medium">
            {/* Social Media Header Badges */}
            <div className="flex items-center gap-1.5">
              {socialItems.map((soc) => (
                <a
                  key={soc.key}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-sky-600 transition-colors flex items-center justify-center text-white border border-slate-700 overflow-hidden"
                  title={soc.name}
                >
                  {soc.customIcon ? (
                    <img src={soc.customIcon} alt={soc.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={`w-full h-full bg-gradient-to-br ${soc.bgGradient} flex items-center justify-center text-[10px] font-black text-white`}>
                      {soc.name.substring(0, 1)}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <span className="text-slate-700">|</span>

            <a
              href={companySettings.social_whatsapp_url || "https://wa.me/5521978869414"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:underline font-bold"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{companySettings.company_whatsapp || "(21) 97886-9414"}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main 2-Column Hero Portal Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Identity + Social Media Row + Promotional Carousel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Portal de Autoatendimento do Cliente
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Sua Gráfica Rápida, Brindes & Comunicação Visual em um só lugar.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acesse o menu de autoatendimento para aprovar artes virtuais, acompanhar o rastreio da produção do seu pedido em tempo real, enviar cadastro ou baixar gabaritos oficiais.
              </p>
            </div>

            {/* Social Media Channels Row */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-600" /> NOSSOS CANAIS & REDES SOCIAIS OFICIAIS
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Siga a Gráfica</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {socialItems.map((soc) => (
                  <a
                    key={soc.key}
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                      {soc.customIcon ? (
                        <img src={soc.customIcon} alt={soc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${soc.bgGradient} flex items-center justify-center text-white font-extrabold text-[10px]`}>
                          {soc.name.substring(0, 1)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                      {soc.name}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Rotating Banner Card */}
            <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${banners[bannerIndex].color} text-white shadow-xl relative overflow-hidden transition-all duration-500 min-h-[240px] flex flex-col justify-between`}>
              <div className="space-y-2 z-10">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {banners[bannerIndex].badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {banners[bannerIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 max-w-md">
                  {banners[bannerIndex].subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 z-10">
                <div className="flex gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBannerIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === bannerIndex ? "w-6 bg-sky-400" : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                <a
                  href={banners[bannerIndex].link}
                  className="px-4 py-2 bg-white hover:bg-sky-50 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <span>{banners[bannerIndex].cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                </a>
              </div>
            </div>

            {/* Guarantee / Features Badge Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-800 block">Prova Digital</span>
                <span className="text-[9px] text-slate-500 block">Validação antes da impressão</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-800 block">Envio Rápido</span>
                <span className="text-[9px] text-slate-500 block">Motoboy e SuperFrete</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <FileCheck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-800 block">Faturamento PJ</span>
                <span className="text-[9px] text-slate-500 block">Boleto e Nota Fiscal</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Autoatendimento Menu */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-600" />
                  Menu de Autoatendimento do Cliente
                </h2>
                <p className="text-xs text-slate-500">
                  Selecione uma das opções abaixo para interagir com a gráfica rápida:
                </p>
              </div>

              <div className="space-y-3">
                
                {/* 1. Novo Cadastro (PF / PJ) */}
                <a
                  href="/cadastro-publico"
                  className="p-4 bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                        Novo Cadastro do Cliente (PF / PJ)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Envie seus dados, endereço de entrega e solicite orçamentos exclusivos.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0" />
                </a>

                {/* 2. Aprovação de Arte Digital com Input Direto */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Aprovação de Arte Digital
                        </h3>
                        <p className="text-xs text-slate-500">
                          Digite o código da sua prova visual ou acesse a lista completa.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Ex: ORD-1002"
                      value={artCodeInput}
                      onChange={(e) => setArtCodeInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono uppercase"
                    />
                    <a
                      href={artCodeInput ? `/aprovar-arte/${artCodeInput}` : "/aprovar-arte"}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Abrir Prova</span>
                    </a>
                  </div>
                </div>

                {/* 3. Rastreio de Pedido em Tempo Real com Input Direto */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Rastreio de Pedido em Tempo Real
                        </h3>
                        <p className="text-xs text-slate-500">
                          Acompanhe as 7 etapas da linha de produção do seu material.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Ex: TRK-9874"
                      value={trackCodeInput}
                      onChange={(e) => setTrackCodeInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono uppercase"
                    />
                    <a
                      href={trackCodeInput ? `/rastreio/${trackCodeInput}` : "/rastreio"}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Rastrear</span>
                    </a>
                  </div>
                </div>

                {/* 4. Gabaritos & Moldes Grátis */}
                <div className="p-4 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                        Central de Download de Gabaritos
                      </h3>
                      <p className="text-xs text-slate-500">
                        Baixe modelos em PDF, CorelDRAW, Illustrator e Photoshop com Sangria.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>

                {/* 5. WhatsApp com Atendente Humanizado */}
                <a
                  href={companySettings.social_whatsapp_url || "https://wa.me/5521978869414?text=Olá!%20Vim%20pelo%20Portal%20da%20Gráfica%20e%20preciso%20de%20atendimento."}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950">
                        Falar no WhatsApp com Atendente
                      </h3>
                      <p className="text-xs text-emerald-700">
                        Tire dúvidas, envie arquivos grandes e solicite orçamento direto com a equipe.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                </a>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">{companySettings.company_name || "VTDIGITAL ART STUDIO & GRÁFICA RÁPIDA"}</span>
            <span>— Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="/portal" className="hover:text-white transition-colors">Portal</a>
            <a href="/cadastro-publico" className="hover:text-white transition-colors">Novo Cadastro</a>
            <a href="/aprovar-arte" className="hover:text-white transition-colors">Provas Digitais</a>
            <a href="/rastreio" className="hover:text-white transition-colors">Rastreio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
