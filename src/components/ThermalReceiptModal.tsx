"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";

interface ThermalReceiptModalProps {
  receipt: {
    receiptNumber: string;
    clientName: string;
    clientDocument?: string;
    clientAddress?: string;
    clientPhone?: string;
    clientCityStateZip?: string;
    items: Array<{ name: string; qty: number; price: number; discount?: number }>;
    subtotal: number;
    discount: number;
    total: string;
    paymentMethod: string;
    receivedAmount?: string;
    change?: string;
    date: string;
    time?: string;
    sellerName?: string;
    notes?: string;
  };
  onClose: () => void;
}

export default function ThermalReceiptModal({ receipt, onClose }: ThermalReceiptModalProps) {
  const [mounted, setMounted] = useState(false);
  const [companySettings, setCompanySettings] = useState<{
    name: string;
    address: string;
    neighborhood: string;
    cityUf: string;
    cnpj: string;
    phone1: string;
    phone2: string;
    email: string;
    website: string;
  }>({
    name: "VTDIGITAL ART STUDIO",
    address: "RUA ARAQUEM 910",
    neighborhood: "BANGU",
    cityUf: "RIO DE JANEIRO - RJ",
    cnpj: "30.189.224/0001-54",
    phone1: "(21) 2038-3504",
    phone2: "(21) 97886-9414",
    email: "contato.vt@vtdigital.com",
    website: "http://www.vtdigital.com.br",
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.map) {
          const m = data.map;
          setCompanySettings({
            name: (m.company_name || m.company_trade_name || "VTDIGITAL ART STUDIO").toUpperCase(),
            address: `${m.company_address || "RUA ARAQUEM"} ${m.company_number || "910"}`.toUpperCase(),
            neighborhood: (m.company_neighborhood || "BANGU").toUpperCase(),
            cityUf: `${m.company_city || "RIO DE JANEIRO"} - ${m.company_uf || "RJ"}`.toUpperCase(),
            cnpj: m.company_cnpj || "30.189.224/0001-54",
            phone1: m.company_phone || "(21) 2038-3504",
            phone2: m.company_whatsapp || "(21) 97886-9414",
            email: m.company_email || "contato.vt@vtdigital.com",
            website: "http://www.vtdigital.com.br",
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.date || new Date().toLocaleDateString("pt-BR");
  const formattedTime = receipt.time || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const fmtNum = (num: number) => num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtQty = (num: number) => num.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const dashedLine = "------------------------------------------";

  const printTarget = typeof document !== "undefined" ? document.getElementById("print-root") : null;

  const printableReceipt = (
    <div className="printable-receipt-80mm bg-white p-1 text-slate-950 font-mono text-[10px] leading-tight space-y-1 select-text">
      {/* Company Header matching Photo 2 */}
      <div className="text-left font-bold space-y-0.5">
        <p className="text-xs uppercase font-black tracking-tight">{companySettings.name}</p>
        <p>{companySettings.address}</p>
        <div className="flex justify-between items-center">
          <span>{companySettings.neighborhood}</span>
          <span className="font-mono">{companySettings.phone1}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="truncate pr-1">{companySettings.email}</span>
          <span className="font-mono shrink-0">{companySettings.phone2}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>{companySettings.cityUf}</span>
          <span className="font-mono">{companySettings.cnpj}</span>
        </div>
        <p>{companySettings.website}</p>
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      {/* Document Title */}
      <div className="font-bold uppercase text-[10px]">
        <p className="font-black">CUPOM NAO FISCAL {receipt.receiptNumber} {formattedTime} {formattedDate}</p>
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      {/* Client Header matching Photo 2 */}
      <div className="font-semibold uppercase space-y-0.5 text-[10px]">
        <p className="font-bold">{receipt.clientName}</p>
        <p>{receipt.clientAddress || "RUA LUZIA DE MACEDO DANTAS, 151"}</p>
        <div className="flex justify-between items-center">
          <span className="font-mono">{receipt.clientDocument || "172.595.737-08"}</span>
          <span className="font-mono">{receipt.clientPhone || "(21) 99690-2449"}</span>
        </div>
        <p>{receipt.clientCityStateZip || "BANGU RIO DE JANEIRO - RJ CEP: 21863-090"}</p>
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      {/* Table Header matching Photo 2 */}
      <div className="font-bold uppercase text-[10px]">
        <div className="flex justify-between">
          <span>Descricao do Produto</span>
          <span>UNI</span>
        </div>
        <div className="flex justify-between font-mono text-[9px] pt-0.5">
          <span className="w-12 text-left">valor</span>
          <span className="w-14 text-center">Quantia</span>
          <span className="w-14 text-center">Desconto</span>
          <span className="w-16 text-right">Vlr Total</span>
        </div>
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      {/* Product Items matching Photo 2 */}
      <div className="space-y-1 uppercase font-semibold text-[10px]">
        {receipt.items.map((item, idx) => {
          const itemDisc = item.discount || 0;
          const itemTotal = item.qty * item.price - itemDisc;
          return (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="line-clamp-1">{item.name}</span>
                <span className="shrink-0 pl-1">UNI</span>
              </div>
              <div className="flex justify-between font-mono text-[9px] text-slate-900 font-bold">
                <span className="w-12 text-left">{fmtNum(item.price)}</span>
                <span className="w-14 text-center">{fmtQty(item.qty)}</span>
                <span className="w-14 text-center">{fmtNum(itemDisc)}</span>
                <span className="w-16 text-right font-black">{fmtNum(itemTotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      {/* Totals Section matching Photo 2 */}
      <div className="space-y-0.5 font-bold uppercase text-[10px]">
        <div className="flex justify-between">
          <span>VALOR PRODUTOS</span>
          <span className="font-mono">R$ {fmtNum(receipt.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>VALOR DESCONTO</span>
          <span className="font-mono">R$ {fmtNum(receipt.discount)}</span>
        </div>
        <div className="flex justify-between text-xs font-black">
          <span>VALOR TOTAL</span>
          <span className="font-mono">R$ {fmtNum(parseFloat(receipt.total))}</span>
        </div>
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      <div className="space-y-0.5 font-bold uppercase text-[10px]">
        <div className="flex justify-between">
          <span>VALOR PAGO</span>
          <span className="font-mono">R$ {fmtNum(receipt.receivedAmount ? parseFloat(receipt.receivedAmount) : parseFloat(receipt.total))}</span>
        </div>
        <div className="flex justify-between">
          <span>VALOR TROCO</span>
          <span className="font-mono">R$ {fmtNum(receipt.change ? parseFloat(receipt.change) : 0)}</span>
        </div>
      </div>

      <p className="font-mono text-[9px] tracking-tighter">{dashedLine}</p>

      {/* Footer Info matching Photo 2 */}
      <div className="text-left space-y-1 font-bold text-[9.5px] uppercase leading-tight">
        <p className="font-extrabold leading-tight">Agradecemos pela preferência, esperamos seu retorno em breve!</p>
        <p>Vendedor: {receipt.sellerName || "TIAGO SOUZA"}</p>
        <p>Situacao: Entrega direto para o cliente</p>
        <p>Entrega: {formattedDate} Hora: {formattedTime}</p>
        <p className="font-black">{receipt.paymentMethod === "cash" ? "AVISTA" : receipt.paymentMethod.toUpperCase()}</p>
        <p className="pt-1 font-black">Informações / Anotações / Observações Geral</p>
        <p className="pl-2 italic font-medium">{receipt.notes || "Não deixe de aproveitar as nossas promoções!!!"}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
        <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-3">
          {/* Action Header in Modal */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
            <span className="font-bold text-xs text-slate-800 uppercase">Imprimir Cupom 80 Colunas</span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* On screen modal render */}
          <div className="max-h-[70vh] overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
            {printableReceipt}
          </div>

          <div className="pt-2 flex gap-2 no-print">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Imprimir 80mm
            </button>
          </div>
        </div>
      </div>

      {/* Render Portal directly to #print-root for zero-bleed printing */}
      {mounted && printTarget ? createPortal(printableReceipt, printTarget) : null}
    </>
  );
}
