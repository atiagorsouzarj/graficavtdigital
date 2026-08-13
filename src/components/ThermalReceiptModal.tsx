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

  const dashedLine = "---------------------------------------";

  const printTarget = typeof document !== "undefined" ? document.getElementById("print-root") : null;

  const receiptContent = (
    <div className="printable-receipt-80mm bg-white p-4 text-black font-mono text-[10.5px] leading-snug space-y-1 select-text uppercase border border-slate-200 shadow-md w-full max-w-[290px] mx-auto rounded-lg my-1">
      {/* Company Header matching Photo 2 */}
      <div className="text-left font-bold space-y-0.5 pr-1">
        <p className="text-[11.5px] font-black tracking-tight">{companySettings.name}</p>
        <p>{companySettings.address}</p>
        <div className="flex justify-between items-center">
          <span>{companySettings.neighborhood}</span>
          <span className="font-mono pr-1">{companySettings.phone1}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="truncate pr-1">{companySettings.email}</span>
          <span className="font-mono shrink-0 pr-1">{companySettings.phone2}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>{companySettings.cityUf}</span>
          <span className="font-mono pr-1">{companySettings.cnpj}</span>
        </div>
        <p className="lowercase font-semibold">{companySettings.website}</p>
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Title */}
      <div className="font-bold text-[10.5px] pr-1">
        <p className="font-black">CUPOM NAO FISCAL {receipt.receiptNumber} {formattedTime} {formattedDate}</p>
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Client Info matching Photo 2 */}
      <div className="font-bold space-y-0.5 text-[10.5px] pr-1">
        <p className="font-black">{receipt.clientName}</p>
        <p>{receipt.clientAddress || "RUA LUZIA DE MACEDO DANTAS, 151"}</p>
        <div className="flex justify-between items-center">
          <span className="font-mono">{receipt.clientDocument || "172.595.737-08"}</span>
          <span className="font-mono pr-1">{receipt.clientPhone || "(21) 99690-2449"}</span>
        </div>
        <p>{receipt.clientCityStateZip || "BANGU RIO DE JANEIRO - RJ CEP: 21863-090"}</p>
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Items Table Header matching Photo 2 */}
      <div className="font-bold text-[10.5px] pr-1">
        <div className="flex justify-between">
          <span>Descricao do Produto</span>
          <span className="pr-1">UNI</span>
        </div>
        <div className="flex justify-between font-mono text-[9.5px] pt-0.5 font-bold">
          <span className="w-11 text-left">valor</span>
          <span className="w-13 text-center">Quantia</span>
          <span className="w-13 text-center">Desconto</span>
          <span className="w-15 text-right pr-1">Vlr Total</span>
        </div>
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Items List matching Photo 2 */}
      <div className="space-y-1 font-bold text-[10.5px] pr-1">
        {receipt.items.map((item, idx) => {
          const itemDisc = item.discount || 0;
          const itemTotal = item.qty * item.price - itemDisc;
          return (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-black">
                <span className="truncate pr-1">{item.name}</span>
                <span className="shrink-0 pr-1">UNI</span>
              </div>
              <div className="flex justify-between font-mono text-[9.5px] font-bold">
                <span className="w-11 text-left">{fmtNum(item.price)}</span>
                <span className="w-13 text-center">{fmtQty(item.qty)}</span>
                <span className="w-13 text-center">{fmtNum(itemDisc)}</span>
                <span className="w-15 text-right font-black pr-1">{fmtNum(itemTotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Totals Section matching Photo 2 */}
      <div className="space-y-0.5 font-bold text-[10.5px] pr-1">
        <div className="flex justify-between">
          <span>VALOR PRODUTOS</span>
          <span className="font-mono font-black pr-1">R$ {fmtNum(receipt.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>VALOR DESCONTO</span>
          <span className="font-mono font-black pr-1">R$ {fmtNum(receipt.discount)}</span>
        </div>
        <div className="flex justify-between text-[11px] font-black pt-0.5">
          <span>VALOR TOTAL</span>
          <span className="font-mono pr-1">R$ {fmtNum(parseFloat(receipt.total))}</span>
        </div>
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Payment Section matching Photo 2 */}
      <div className="space-y-0.5 font-bold text-[10.5px] pr-1">
        <div className="flex justify-between">
          <span>VALOR PAGO</span>
          <span className="font-mono font-black pr-1">R$ {fmtNum(receipt.receivedAmount ? parseFloat(receipt.receivedAmount) : parseFloat(receipt.total))}</span>
        </div>
        <div className="flex justify-between">
          <span>VALOR TROCO</span>
          <span className="font-mono font-black pr-1">R$ {fmtNum(receipt.change ? parseFloat(receipt.change) : 0)}</span>
        </div>
      </div>

      <p className="font-mono text-[9.5px] tracking-tight text-slate-800">{dashedLine}</p>

      {/* Footer Instructions matching Photo 2 */}
      <div className="text-left space-y-1 font-bold text-[9.5px] leading-snug pr-1">
        <p className="font-black">Agradecemos pela preferência, esperamos seu retorno em breve!</p>
        <p>Vendedor: {receipt.sellerName || "TIAGO SOUZA"}</p>
        <p>Situacao: Entrega direto para o cliente</p>
        <p>Entrega: {formattedDate} Hora: {formattedTime}</p>
        <p className="font-black">{receipt.paymentMethod === "cash" ? "AVISTA" : receipt.paymentMethod.toUpperCase()}</p>
        <p className="pt-1 font-black">Informações / Anotações / Observações Geral</p>
        <p className="pl-1 normal-case font-semibold italic">{receipt.notes || "Não deixe de aproveitar as nossas promoções!!!"}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* On-screen Modal View */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
        <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-3">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
            <span className="font-black text-xs text-slate-800 uppercase tracking-wide">
              IMPRIMIR CUPOM 80 COLUNAS
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[68vh] overflow-y-auto p-3 border border-slate-200 rounded-2xl bg-slate-300/50 shadow-inner flex justify-center">
            {receiptContent}
          </div>

          <div className="pt-2 flex gap-2 no-print">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" /> Imprimir 80mm
            </button>
          </div>

        </div>
      </div>

      {/* Render directly to #print-root for 1:1 Thermal Printing */}
      {mounted && printTarget ? createPortal(receiptContent, printTarget) : null}
    </>
  );
}
