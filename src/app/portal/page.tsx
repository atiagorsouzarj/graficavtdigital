"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  Sparkles,
  UserPlus,
  Truck,
  Download,
  MessageSquare,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Share2,
  ExternalLink,
  Lock,
  User,
} from "lucide-react";

export default function PublicPortalPage() {
  const [bannerIndex, setBannerIndex] = useState(0);
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
      link: "/cliente/login?redirect=/cliente/pedidos",
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
            <Link href="/portal" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-wider bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                  VTDIGITAL
                </span>
                <span className="text-[10px] font-bold text-sky-400 block tracking-widest uppercase">
                  Art Studio & Gráfica Rápida
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-300 font-medium">
            <Link
              href="/cliente/login"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sou Cliente</span>
            </Link>

            <Link
              href="/cadastro-publico"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar</span>
            </Link>

            <span className="text-slate-700">|</span>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Banner principal de login do cliente */}
        <div className="mb-6 bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-black">Já é nosso cliente?</h2>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              Acompanhe seus pedidos, aprove artes digitais e gerencie pagamentos pela sua área exclusiva.
            </p>
          </div>
          <Link
            href="/cliente/login"
            className="px-5 py-2.5 bg-white hover:bg-sky-50 text-sky-700 font-extrabold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <ArrowRight className="w-4 h-4" /> Entrar na Minha Conta
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Identidade + Redes + Banner */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Bem-vindo à Gráfica
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Sua Gráfica Rápida, Brindes & Comunicação Visual em um só lugar.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Atendemos empresas e pessoas físicas com impressão digital,
                sublimação, DTF, comunicação visual, brindes personalizados e
                papelaria comercial. Cadastre-se, peça seu orçamento e
                acompanhe tudo pelo portal.
              </p>
            </div>

            {/* Redes sociais */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-600" /> NOSSOS CANAIS & REDES SOCIAIS
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

            {/* Banner rotativo */}
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

                <Link
                  href={banners[bannerIndex].link}
                  className="px-4 py-2 bg-white hover:bg-sky-50 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <span>{banners[bannerIndex].cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                </Link>
              </div>
            </div>

            {/* Trust badges */}
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

          {/* RIGHT: Atalhos rápidos (visitantes) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  Atalhos Rápidos
                </h2>
                <p className="text-xs text-slate-500">
                  Você não precisa de login para usar estas opções.
                </p>
              </div>

              <div className="space-y-3">
                {/* Rastrear pedido (com token) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Rastrear Pedido (Visitante)</h3>
                      <p className="text-xs text-slate-500">
                        Cole o link enviado pela gráfica (com código do pedido).
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={trackCodeInput}
                      onChange={(e) => setTrackCodeInput(e.target.value)}
                      placeholder="Cole o link completo ou código do pedido"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                    />
                    <Link
                      href={
                        trackCodeInput.startsWith("http")
                          ? trackCodeInput
                          : trackCodeInput
                          ? `/rastreio/${encodeURIComponent(trackCodeInput)}`
                          : "/rastreio"
                      }
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Rastrear</span>
                    </Link>
                  </div>
                </div>

                {/* Central de Gabaritos */}
                <Link
                  href="/cliente/gabaritos"
                  className="p-4 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                        Central de Gabaritos
                      </h3>
                      <p className="text-xs text-slate-500">
                        Baixe modelos em PDF, CorelDRAW, AI e PSD com sangria.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>

                {/* WhatsApp */}
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
                        Tire dúvidas, envie arquivos grandes e solicite orçamento.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                </a>
              </div>

              {/* Divisor */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Áreas com login</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <Link
                href="/cliente/login"
                className="block p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-sky-700 shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-sky-900">Acompanhar meus pedidos com login</h3>
                    <p className="text-[10px] text-sky-700">Acesse suas artes, pagamentos e histórico completo</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-600" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">{companySettings.company_name || "VTDIGITAL ART STUDIO & GRÁFICA RÁPIDA"}</span>
            <span>— Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/portal" className="hover:text-white transition-colors">Portal</Link>
            <Link href="/cadastro-publico" className="hover:text-white transition-colors">Novo Cadastro</Link>
            <Link href="/cliente/login" className="hover:text-white transition-colors">Sou Cliente</Link>
            <Link href="/cliente/gabaritos" className="hover:text-white transition-colors">Gabaritos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
