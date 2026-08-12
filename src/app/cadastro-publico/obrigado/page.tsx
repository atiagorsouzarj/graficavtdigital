"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, MessageSquare, ArrowRight, Sparkles, PhoneCall, Home } from "lucide-react";

export default function CadastroObrigadoPage() {
  const [companyPhone, setCompanyPhone] = useState("(11) 98877-6655");
  const [companyName, setCompanyName] = useState("PrintFlow Gráfica Criativa");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.map) {
          if (d.map.company_whatsapp || d.map.company_phone) {
            setCompanyPhone(d.map.company_whatsapp || d.map.company_phone);
          }
          if (d.map.company_name) setCompanyName(d.map.company_name);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const cleanPhone = companyPhone.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            CADASTRO RECEBIDO COM SUCESSO!
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Agradecemos pelo seu cadastro!
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Seus dados foram enviados para nossa equipe da <strong>{companyName}</strong>. Já estamos analisando a sua solicitação e em breve entraremos em contato via WhatsApp ou e-mail com a sua cotação!
          </p>
        </div>

        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 space-y-1">
          <strong className="block font-bold">Precisa de atendimento urgente?</strong>
          <p className="text-[11px] text-sky-800">
            Fale agora mesmo direto com um de nossos consultores no WhatsApp:
          </p>
        </div>

        <div className="space-y-2">
          <a
            href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
              "Olá! Acabei de realizar o meu cadastro prévio e gostaria de solicitar um orçamento!"
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp Agora ({companyPhone})</span>
          </a>

          <a
            href="/"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Voltar à Página Principal</span>
          </a>
        </div>
      </div>
    </div>
  );
}
