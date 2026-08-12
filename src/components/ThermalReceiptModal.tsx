"use client";

import React, { useState, useEffect } from "react";
import { Printer, X, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ThermalReceiptModalProps {
  receipt: {
    receiptNumber: string;
    clientName: string;
    items: Array<{ name: string; qty: number; price: number }>;
    subtotal: number;
    discount: number;
    total: string;
    paymentMethod: string;
    receivedAmount?: string;
    change?: string;
    date: string;
  };
  onClose: () => void;
}

export default function ThermalReceiptModal({ receipt, onClose }: ThermalReceiptModalProps) {
  const [companySettings, setCompanySettings] = useState<{
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    logoUrl?: string;
  }>({
    name: "GRÁFICA & PAPELARIA EXPRESS",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Gráficas, 500 - SP",
    phone: "(11) 3456-7890",
    logoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.map) {
          const map = data.map;
          setCompanySettings({
            name: map.company_name || map.company_trade_name || "GRÁFICA & PAPELARIA EXPRESS",
            cnpj: map.company_cnpj || "12.345.678/0001-90",
            address: `${map.company_address || "Rua das Gráficas"}, ${map.company_number || "500"} - ${map.company_city || "SP"}`,
            phone: map.company_phone || map.company_whatsapp || "(11) 3456-7890",
            logoUrl: map.company_logo_url || undefined,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 80 Column Thermal Paper Receipt Format */}
        <div className="bg-amber-50/50 p-4 border border-dashed border-amber-300 rounded-xl font-mono text-[11px] text-slate-800 space-y-2 select-text shadow-xs">
          {/* Company Logo Header if present */}
          {companySettings.logoUrl && (
            <div className="text-center pb-1">
              <img
                src={companySettings.logoUrl}
                alt="Logo Empresa"
                className="h-12 max-w-[180px] mx-auto object-contain"
              />
            </div>
          )}

          <div className="text-center font-bold space-y-0.5">
            <p className="text-sm tracking-wider uppercase font-black">{companySettings.name}</p>
            <p className="text-[10px] text-slate-500 font-normal">CNPJ: {companySettings.cnpj}</p>
            <p className="text-[10px] text-slate-500 font-normal">{companySettings.address}</p>
            <p className="text-[10px] text-slate-500 font-normal">Tel: {companySettings.phone}</p>
            <div className="border-b border-dashed border-slate-400 my-1" />
            <p className="text-xs uppercase font-extrabold text-slate-900">COMPROVANTE NÃO FISCAL</p>
            <p className="text-[10px]">PEDIDO: {receipt.receiptNumber}</p>
            <p className="text-[10px] text-slate-500">{receipt.date}</p>
          </div>

          <div className="border-b border-dashed border-slate-400 my-1" />

          <div>
            <p><strong>CLIENTE:</strong> {receipt.clientName}</p>
            <p><strong>OPERADOR:</strong> Tiago Souza (Caixa 01)</p>
          </div>

          <div className="border-b border-dashed border-slate-400 my-1" />

          {/* Items Header */}
          <div className="flex justify-between font-bold text-[10px] uppercase">
            <span>QTD x ITEM</span>
            <span>TOTAL</span>
          </div>

          <div className="space-y-1">
            {receipt.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start leading-tight">
                <span className="flex-1 pr-2">
                  {item.qty}x {item.name}
                  <span className="block text-[9px] text-slate-500">Un: {formatCurrency(item.price)}</span>
                </span>
                <span className="font-bold">{formatCurrency(item.qty * item.price)}</span>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-slate-400 my-1" />

          <div className="space-y-0.5 text-right font-semibold">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-400">
              <span>TOTAL PAGO:</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-400 my-1" />

          <div className="text-[10px]">
            <p><strong>PAGAMENTO:</strong> {receipt.paymentMethod.toUpperCase()}</p>
            {receipt.receivedAmount && (
              <p><strong>RECEBIDO:</strong> {formatCurrency(receipt.receivedAmount)}</p>
            )}
            {receipt.change && parseFloat(receipt.change) > 0 && (
              <p><strong>TROCO:</strong> {formatCurrency(receipt.change)}</p>
            )}
          </div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          {/* QR Code section for Non-Fiscal Receipt Verification */}
          <div className="text-center space-y-1">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PEDIDO_${receipt.receiptNumber}`}
              alt="QR Receipt"
              className="w-20 h-20 mx-auto rounded-md"
            />
            <p className="text-[9px] text-slate-500">Obrigado pela preferência!</p>
            <p className="text-[8px] text-slate-400">Volte Sempre • Papelaria Personalizada</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" /> Imprimir 80mm
          </button>
        </div>
      </div>
    </div>
  );
}
