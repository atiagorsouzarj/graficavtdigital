"use client";

import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, QrCode, Share2, Download, FileCode } from "lucide-react";

interface PublicLinksModalProps {
  onClose: () => void;
}

export default function PublicLinksModal({ onClose }: PublicLinksModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const host = typeof window !== "undefined" ? window.location.origin : "https://printflow.com.br";

  const links = [
    {
      key: "portal_hub",
      title: "Portal Central do Cliente (Autoatendimento Foto 3)",
      desc: "Hub principal com carrossel de ofertas, aprovação de arte, rastreio de pedidos e cadastro.",
      url: `${host}/portal`,
    },
    {
      key: "client_signup",
      title: "Cadastro Público de Cliente (PF / PJ)",
      desc: "Formulário rápido para o próprio cliente preencher dados fiscais, endereço e WhatsApp.",
      url: `${host}/cadastro-publico`,
    },
    {
      key: "art_portal",
      title: "Portal de Aprovação de Arte Digital",
      desc: "Link público de prova visual onde o cliente aprova ou solicita alterações no layout.",
      url: `${host}/aprovar-arte/demo-art-1`,
    },
    {
      key: "order_tracking",
      title: "Rastreio e Acompanhamento de Pedido",
      desc: "Status em tempo real da produção e etiqueta de envio SuperFrete.",
      url: `${host}/rastreio/PV-0000101`,
    },
  ];

  const gabaritos = [
    { name: "Gabarito Cartão de Visita 9x5cm (Sangria 2mm)", format: "PDF / PNG / CDR" },
    { name: "Gabarito Panfleto / Folder A5 (15x21cm)", format: "PDF / PNG / CDR" },
    { name: "Gabarito Caneca 325ml (20x9cm)", format: "PDF / PNG / PSD" },
    { name: "Molde Caixa Cone / Pirâmide Festas", format: "PDF / PNG / DXF" },
  ];

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Links Públicos & Gabaritos da Gráfica</h2>
            <p className="text-xs text-slate-500">Compartilhe com clientes para autoatendimento e download de moldes</p>
          </div>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{link.title}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  Abrir <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-slate-500">{link.desc}</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={link.url}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 font-mono text-[11px]"
                />
                <button
                  onClick={() => handleCopy(link.key, link.url)}
                  className="px-3 py-1 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === link.key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Gabaritos e Moldes de Impressão Download Section */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
          <span className="font-bold text-sky-400 block border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-400" /> Gabaritos & Moldes de Impressão (Download Cliente)
          </span>

          <div className="space-y-1.5">
            {gabaritos.map((g, gidx) => (
              <div
                key={gidx}
                className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <strong className="text-slate-200 block text-xs">{g.name}</strong>
                  <span className="text-[10px] text-slate-400">{g.format}</span>
                </div>
                <button
                  onClick={() => alert(`Baixando gabarito de corte: ${g.name}`)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Baixar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
