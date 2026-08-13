"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X, Download, FileText, Send, CheckSquare, Square, ShoppingBag } from "lucide-react";
import { formatCurrency, formatDateOnly } from "@/lib/utils";
import { printWithStyle, cleanupPrintStyles } from "@/lib/printStyles";
import ThermalReceiptModal from "./ThermalReceiptModal";

interface QuotePdfModalProps {
  order: {
    id?: string;
    code: string;
    type?: string;
    clientName: string;
    clientDocument?: string;
    clientEmail?: string;
    clientPhone?: string;
    shippingAddress?: string;
    subtotalAmount: string;
    discountAmount: string;
    freightAmount: string;
    totalAmount: string;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    shippingMethod?: string;
    notes?: string;
    createdAt: string;
    items?: Array<{ productName: string; quantity: number; unitPrice: string; totalPrice: string }>;
  };
  onClose: () => void;
}

export default function QuotePdfModal({ order, onClose }: QuotePdfModalProps) {
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [companySettings, setCompanySettings] = useState<{
    name: string;
    subtitle: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    logoUrl?: string;
  }>({
    name: "PrintFlow Gráfica Criativa",
    subtitle: "GRÁFICA RÁPIDA E PERSONALIZADOS",
    cnpj: "12.345.678/0001-90",
    phone: "(11) 4002-8922",
    email: "contato@printflow.com.br",
    address: "Rua das Gráficas, 500 - São Paulo SP",
    logoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80",
  });

  // Checkbox states for production order sheet
  const [arteConferida, setArteConferida] = useState(true);
  const [materialSeparado, setMaterialSeparado] = useState(true);
  const [producaoRevisada, setProducaoRevisada] = useState(false);
  const [embalado, setEmbalado] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.map) {
          const m = data.map;
          setCompanySettings({
            name: m.company_name || m.company_trade_name || "PrintFlow Gráfica Criativa",
            subtitle: "GRÁFICA RÁPIDA E PERSONALIZADOS",
            cnpj: m.company_cnpj || "12.345.678/0001-90",
            phone: m.company_phone || m.company_whatsapp || "(11) 4002-8922",
            email: m.company_email || "contato@printflow.com.br",
            address: `${m.company_address || "Rua das Gráficas"}, ${m.company_number || "500"} - ${m.company_city || "São Paulo"} ${m.company_uf || "SP"}`,
            logoUrl: m.company_logo_url || undefined,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePrintA4 = () => {
    // Aplica @page { size: A4 } dinamicamente para não conflitar com o cupom 80mm
    printWithStyle({
      pageSize: "A4",
      margin: "10mm",
      extraCss: `
        .printable-area-a4 {
          width: 100% !important;
          max-width: 210mm !important;
          margin: 0 auto !important;
          padding: 8mm 10mm !important;
          box-sizing: border-box !important;
          font-size: 10pt !important;
          line-height: 1.35 !important;
        }
        .printable-area-a4 button,
        .printable-area-a4 input[type="checkbox"] {
          display: none !important;
        }
      `,
    });
  };

  // Limpa qualquer style de impressão ao fechar
  useEffect(() => {
    return () => cleanupPrintStyles();
  }, []);

  const subtotal = parseFloat(order.subtotalAmount || "0");
  const freight = parseFloat(order.freightAmount || "0");
  const discount = parseFloat(order.discountAmount || "0");
  const total = parseFloat(order.totalAmount || "0");

  const printTarget = typeof document !== "undefined" ? document.getElementById("print-root") : null;

  const printableContent = (
    <div className="printable-area-a4 bg-white p-6 sm:p-8 border border-slate-200 rounded-2xl space-y-6 text-xs text-slate-800 select-text shadow-sm w-full">
      {/* Header: Company Name & Contact Info */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {companySettings.name}
          </h1>
          <p className="text-[11px] font-bold text-sky-600 tracking-wider uppercase">
            {companySettings.subtitle}
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-500 space-y-0.5">
          <p className="font-semibold text-slate-700">{companySettings.address}</p>
          <p>{companySettings.phone}</p>
          <p>{companySettings.email}</p>
          <p className="font-mono text-slate-600">CNPJ {companySettings.cnpj}</p>
        </div>
      </div>

      {/* Title Banner: ORDEM DE PRODUÇÃO / PEDIDO */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="border-l-4 border-sky-600 pl-3">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
            ORDEM DE PRODUÇÃO / PROPOSTA
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {order.code}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Emissão</span>
          <span className="font-extrabold text-slate-800 text-sm block">
            {formatDateOnly(order.createdAt)}
          </span>
          <span className="bg-sky-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider block mt-1">
            {order.status === "completed" ? "CONCLUÍDO" : "APROVADO"}
          </span>
        </div>
      </div>

      {/* Dados do Cliente Block */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 border-b border-sky-600 pb-1">
          Dados do cliente
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">CLIENTE</span>
            <strong className="text-slate-900 block font-bold">{order.clientName}</strong>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">CPF/CNPJ</span>
            <span className="font-mono text-slate-700">{order.clientDocument || "—"}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">CONTATO</span>
            <span className="text-slate-700">{order.clientPhone || "—"}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">E-MAIL</span>
            <span className="text-slate-700 font-medium">{order.clientEmail || "—"}</span>
          </div>

          {order.shippingAddress && (
            <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">ENDEREÇO DE ENTREGA</span>
              <span className="text-slate-700">{order.shippingAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Condições do Pedido Block */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 border-b border-sky-600 pb-1">
          Condições do pedido
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">CANAL</span>
            <strong className="text-slate-800">Atendimento Balcão</strong>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">PAGAMENTO</span>
            <strong className="text-slate-800 uppercase">{order.paymentMethod || "Pix"}</strong>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">ETAPA ATUAL</span>
            <strong className="text-sky-700 uppercase font-extrabold">{order.status}</strong>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">SITUAÇÃO FINANCEIRA</span>
            <span
              className={`font-black uppercase ${
                order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {order.paymentStatus === "paid" ? "pago" : "pendente"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">ENTREGA</span>
            <strong className="text-slate-800 uppercase">{order.shippingMethod || "Balcão"}</strong>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">PREVISÃO</span>
            <strong className="text-slate-800">{formatDateOnly(order.createdAt)}</strong>
          </div>
        </div>
      </div>

      {/* Products Itemization Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-600 text-white font-bold uppercase text-[10px]">
            <tr>
              <th className="p-2.5 text-center w-10">#</th>
              <th className="p-2.5">Descrição do produto / serviço</th>
              <th className="p-2.5 text-center">Qtd.</th>
              <th className="p-2.5 text-right">Unitário</th>
              <th className="p-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 text-center text-slate-400 font-mono">
                    {(idx + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="p-2.5 font-bold text-slate-800">{item.productName}</td>
                  <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                  <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-2.5 text-right font-extrabold text-slate-900">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2.5 text-center text-slate-400 font-mono">01</td>
                <td className="p-2.5 font-bold text-slate-800">
                  Pedido de Impressão e Serviços Gráficos
                </td>
                <td className="p-2.5 text-center font-bold">1</td>
                <td className="p-2.5 text-right">{formatCurrency(subtotal)}</td>
                <td className="p-2.5 text-right font-extrabold text-slate-900">
                  {formatCurrency(subtotal)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Observations & Production Checkboxes & Totals Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <div className="sm:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-sky-600 pb-1">
            Informações / anotações / observações
          </h3>

          <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
            {order.notes || "Sem observações registradas."}
          </p>

          {/* Checkboxes matching Screenshot 1 */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-semibold pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={arteConferida}
                onChange={(e) => setArteConferida(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Arte conferida</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={materialSeparado}
                onChange={(e) => setMaterialSeparado(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Material separado</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={producaoRevisada}
                onChange={(e) => setProducaoRevisada(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Produção revisada</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={embalado}
                onChange={(e) => setEmbalado(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Embalado</span>
            </label>
          </div>
        </div>

        {/* Totals Box matching Screenshot 1 */}
        <div className="space-y-1.5 self-end text-xs font-semibold">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Frete</span>
            <span className="font-bold text-slate-800">{formatCurrency(freight)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Desconto</span>
            <span className="font-bold text-slate-800">
              - {formatCurrency(discount)}
            </span>
          </div>

          <div className="bg-sky-600 text-white p-3 rounded-xl flex items-center justify-between text-sm font-black shadow-xs">
            <span>Total</span>
            <span className="text-xl">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Signature Lines matching Screenshot 1 */}
      <div className="pt-8 grid grid-cols-2 gap-12 text-center text-[10px] text-slate-500">
        <div>
          <div className="border-t border-slate-300 pt-1.5 font-medium">
            Responsável pela produção
          </div>
        </div>

        <div>
          <div className="border-t border-slate-300 pt-1.5 font-medium">
            Cliente / retirada / recebimento
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-[9px] text-slate-400 pt-3 border-t border-slate-100">
        {companySettings.name} • Pedido sem valor fiscal.
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
        <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-4">
          {/* Top Action Bar matching Screenshot 1 */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-100 pb-3 no-print">
            <button
              onClick={() => setShowThermalReceipt(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir cupom 80 mm</span>
            </button>

            <button
              onClick={handlePrintA4}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Imprimir A4 / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>

          {/* On screen modal render */}
          {printableContent}
        </div>
      </div>

      {/* Render Portal directly to #print-root ONLY IF showThermalReceipt is FALSE (prevents mixing A4 + Thermal Receipt) */}
      {mounted && printTarget && !showThermalReceipt ? createPortal(printableContent, printTarget) : null}

      {/* Thermal Receipt 80mm Modal */}
      {showThermalReceipt && (
        <ThermalReceiptModal
          receipt={{
            receiptNumber: order.code,
            clientName: order.clientName,
            clientDocument: order.clientDocument,
            clientPhone: order.clientPhone,
            clientAddress: order.shippingAddress,
            items: order.items
              ? order.items.map((i) => ({ name: i.productName, qty: i.quantity, price: parseFloat(i.unitPrice) }))
              : [{ name: "Serviço Gráfico", qty: 1, price: subtotal }],
            subtotal,
            discount,
            total: total.toFixed(2),
            paymentMethod: order.paymentMethod || "Pix",
            date: formatDateOnly(order.createdAt),
            time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            notes: order.notes,
            sellerName: undefined,
          }}
          onClose={() => setShowThermalReceipt(false)}
        />
      )}
    </>
  );
}
