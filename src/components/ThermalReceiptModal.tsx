"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Printer, X, Download } from "lucide-react";
import { printWithStyle, cleanupPrintStyles } from "@/lib/printStyles";

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

const PAPER_WIDTH_MM = 80; // impressora térmica padrão 80 colunas
// Conversão mm → px (96 dpi): 1mm = 3.7795 px
const PAPER_WIDTH_PX = Math.round(PAPER_WIDTH_MM * 3.7795); // ≈ 302px

const formatBRL = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "0,00";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatQty = (value: number) => {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};

// Preenche com espaços à esquerda para alinhar valores à direita (largura fixa)
const padLeft = (str: string, width: number) => {
  if (str.length >= width) return str.slice(0, width);
  return " ".repeat(width - str.length) + str;
};

// Monta linha com label à esquerda e valor à direita dentro de uma largura fixa (em colunas)
const makeRow = (label: string, value: string, totalCols: number) => {
  const cols = Math.max(0, totalCols - value.length);
  return label.length > cols ? label.slice(0, cols) + value : label + " ".repeat(cols - label.length) + value;
};

// Traço pontilhado de 42 caracteres (largura típica de cupom 80mm)
const DASH = "-".repeat(42);
const EQUAL = "=".repeat(42);

export default function ThermalReceiptModal({ receipt, onClose }: ThermalReceiptModalProps) {
  const [mounted, setMounted] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: "VTDIGITAL ART STUDIO",
    address: "RUA ARAQUEM, 910",
    neighborhood: "BANGU",
    cityUf: "RIO DE JANEIRO - RJ",
    cnpj: "30.189.224/0001-54",
    phone1: "(21) 2038-3504",
    phone2: "(21) 97886-9414",
    email: "contato.vt@vtdigital.com",
    website: "www.vtdigital.com.br",
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.map) {
          const m = data.map;
          setCompanySettings((prev) => ({
            name: (m.company_name || m.company_trade_name || prev.name).toUpperCase(),
            address: `${m.company_address || "RUA ARAQUEM"}, ${m.company_number || "910"}`.toUpperCase(),
            neighborhood: (m.company_neighborhood || prev.neighborhood).toUpperCase(),
            cityUf: `${m.company_city || "RIO DE JANEIRO"} - ${m.company_uf || "RJ"}`.toUpperCase(),
            cnpj: m.company_cnpj || prev.cnpj,
            phone1: m.company_phone || prev.phone1,
            phone2: m.company_whatsapp || prev.phone2,
            email: (m.company_email || prev.email).toLowerCase(),
            website: (m.company_website || prev.website).replace(/^https?:\/\//, "").toLowerCase(),
          }));
        }
      })
      .catch(() => {
        // mantém defaults
      });
  }, []);

  // Monta o texto monoespaçado do cupom (largura 42 colunas = ~80mm a 12cpi)
  const receiptText = useMemo(() => {
    const COLS = 42;
    const lines: string[] = [];
    const center = (s: string) => {
      const pad = Math.max(0, Math.floor((COLS - s.length) / 2));
      return " ".repeat(pad) + s.slice(0, COLS);
    };

    // Cabeçalho da empresa
    lines.push(center(companySettings.name));
    lines.push(center(companySettings.address));
    lines.push(center(companySettings.neighborhood));
    lines.push(makeRow(companySettings.cityUf, companySettings.cnpj, COLS));
    lines.push(makeRow(companySettings.phone1, companySettings.phone2, COLS));
    lines.push(center(companySettings.email));
    lines.push(center(companySettings.website));
    lines.push(DASH);

    // Tipo e número do cupom
    const cupomLine = `CUPOM NAO FISCAL  ${receipt.receiptNumber}`;
    lines.push(center(cupomLine));
    const dataHora = `Data: ${receipt.date}  Hora: ${receipt.time || "--:--"}`;
    lines.push(center(dataHora));
    lines.push(DASH);

    // Cliente
    lines.push("CLIENTE:");
    lines.push(receipt.clientName.toUpperCase().slice(0, COLS));
    if (receipt.clientDocument) {
      lines.push(`CPF/CNPJ: ${receipt.clientDocument}`);
    }
    if (receipt.clientAddress) {
      lines.push(receipt.clientAddress.toUpperCase().slice(0, COLS));
    }
    if (receipt.clientCityStateZip) {
      lines.push(receipt.clientCityStateZip.toUpperCase().slice(0, COLS));
    }
    if (receipt.clientPhone) {
      lines.push(receipt.clientPhone);
    }
    lines.push(DASH);

    // Cabeçalho de itens (larguras fixas: 8 + 8 + 8 + 10 = 34 chars, padded com espaços)
    lines.push("DESCRICAO DO PRODUTO");
    //        0123456789012345678901234567890123456789 01
    //        0         1         2         3         4
    const colHeader = "   VALOR" + "     QTD" + "    DESC" + "     TOTAL";
    lines.push(colHeader);
    lines.push(DASH);

    // Itens
    let subtotalCalc = 0;
    let totalDesc = 0;
    receipt.items.forEach((it) => {
      const itemDisc = it.discount || 0;
      const itemTotal = it.qty * it.price - itemDisc;
      subtotalCalc += it.qty * it.price;
      totalDesc += itemDisc;
      // Quebra nome do produto em linhas de 42 colunas
      const nome = (it.name || "").toUpperCase();
      for (let i = 0; i < nome.length; i += COLS) {
        lines.push(nome.slice(i, i + COLS));
      }
      // Linha de valores: VALOR(8) + " "(2) + QTD(8) + " "(2) + DESC(8) + " "(2) + TOTAL(10) = 40 chars
      const valor = formatBRL(it.price).padStart(8);
      const qtd = formatQty(it.qty).padStart(8);
      const desc = formatBRL(itemDisc).padStart(8);
      const total = formatBRL(itemTotal).padStart(10);
      lines.push(`   ${valor}  ${qtd}  ${desc}  ${total}`);
      lines.push(""); // linha em branco entre itens
    });

    lines.push(DASH);
    lines.push(EQUAL);

    // Totais
    const subtotalFinal = receipt.subtotal || subtotalCalc;
    const descontoFinal = receipt.discount || totalDesc;
    lines.push(makeRow("VALOR PRODUTOS", `R$ ${formatBRL(subtotalFinal)}`, COLS));
    lines.push(makeRow("VALOR DESCONTO", `R$ ${formatBRL(descontoFinal)}`, COLS));
    lines.push(EQUAL);
    lines.push(makeRow("VALOR TOTAL", `R$ ${formatBRL(receipt.total)}`, COLS));
    lines.push(EQUAL);

    // Pagamento
    const pago = receipt.receivedAmount
      ? parseFloat(receipt.receivedAmount)
      : parseFloat(receipt.total);
    const troco = receipt.change ? parseFloat(receipt.change) : 0;
    lines.push(makeRow("VALOR PAGO", `R$ ${formatBRL(pago)}`, COLS));
    lines.push(makeRow("VALOR TROCO", `R$ ${formatBRL(troco)}`, COLS));
    lines.push(DASH);

    // Rodapé
    lines.push(center("Agradecemos pela preferencia!"));
    lines.push(center("Esperamos seu retorno em breve."));
    lines.push(DASH);
    lines.push(`Vendedor: ${receipt.sellerName || "TIAGO SOUZA"}`);
    lines.push(`Situacao: Entrega direta ao cliente`);
    lines.push(`Entrega: ${receipt.date} Hora: ${receipt.time || "--:--"}`);
    const formaPgto =
      receipt.paymentMethod === "cash"
        ? "A VISTA"
        : receipt.paymentMethod === "pix"
        ? "PIX"
        : receipt.paymentMethod === "card"
        ? "CARTAO"
        : (receipt.paymentMethod || "A VISTA").toUpperCase();
    lines.push(`Pagamento: ${formaPgto}`);
    lines.push(DASH);
    if (receipt.notes) {
      const notes = receipt.notes.toUpperCase();
      for (let i = 0; i < notes.length; i += COLS) {
        lines.push(notes.slice(i, i + COLS));
      }
      lines.push(DASH);
    }
    lines.push(center("--- FIM DO CUPOM ---"));

    return lines.join("\n");
  }, [receipt, companySettings]);

  const handlePrint = () => {
    // Aplica @page { size: 80mm } dinamicamente e imprime
    printWithStyle({
      pageSize: "80mm auto",
      extraCss: `
        .receipt-print-portal {
          width: 80mm !important;
          max-width: 80mm !important;
          min-width: 80mm !important;
          padding: 2mm !important;
          font-size: 10pt !important;
          line-height: 1.3 !important;
        }
      `,
    });
  };

  // Limpa qualquer style de impressão ao fechar
  useEffect(() => {
    return () => cleanupPrintStyles();
  }, []);

  // Gera HTML standalone para download (opcional)
  const handleDownload = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Cupom ${receipt.receiptNumber}</title>
<style>
@page { size: 80mm auto; margin: 0; }
body { width: 80mm; margin: 0; padding: 4mm; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; white-space: pre; }
</style></head><body>${receiptText}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cupom-${receipt.receiptNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printTarget = typeof document !== "undefined" ? document.getElementById("print-root") : null;

  // Cupom formatado em CSS para visualização (largura fixa 80mm = 302px)
  const receiptPaper = (
    <div
      className="receipt-paper bg-white text-black font-mono uppercase shadow-md select-text"
      style={{
        width: `${PAPER_WIDTH_PX}px`,
        minWidth: `${PAPER_WIDTH_PX}px`,
        maxWidth: `${PAPER_WIDTH_PX}px`,
        padding: "12px 10px",
        fontSize: "12px",
        lineHeight: "1.35",
        whiteSpace: "pre",
        boxSizing: "border-box",
        color: "#000",
        background: "#fff",
      }}
    >
      {receiptText}
    </div>
  );

  return (
    <>
      {/* Modal na tela */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 overflow-hidden">
          {/* Cabeçalho do modal (acima do cupom) */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
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

          {/* Área do cupom: fundo cinza contrastando com o card branco, scroll interno */}
          <div className="px-5 py-4 bg-slate-200/70 max-h-[70vh] overflow-y-auto flex justify-center">
            {receiptPaper}
          </div>

          {/* Botões de ação (rodapé do card branco) */}
          <div className="px-5 py-4 border-t border-slate-100 flex gap-2 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Baixar cupom como HTML"
            >
              <Download className="w-4 h-4" /> HTML
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

      {/* Portal para impressão: conteúdo isolado, largura 80mm exata */}
      {mounted && printTarget
        ? createPortal(
            <div
              className="receipt-print-portal"
              style={{
                width: `${PAPER_WIDTH_PX}px`,
                minWidth: `${PAPER_WIDTH_PX}px`,
                maxWidth: `${PAPER_WIDTH_PX}px`,
                background: "#fff",
                color: "#000",
                fontFamily: "'Courier New', 'Consolas', monospace",
                fontSize: "12px",
                lineHeight: "1.35",
                whiteSpace: "pre",
                padding: "6mm 4mm",
                boxSizing: "border-box",
                margin: 0,
                position: "static",
                left: "auto",
                top: "auto",
                visibility: "visible",
                display: "block",
              }}
            >
              {receiptText}
            </div>,
            printTarget
          )
        : null}
    </>
  );
}
