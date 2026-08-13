"use client";

/**
 * Helper para injetar @page e CSS de impressão específico antes de window.print().
 * O `#print-root` é compartilhado entre múltiplos modais (cupom 80mm, A4, etc.).
 * Cada modal aplica seu próprio @page / @media print só durante a impressão.
 */
const STYLE_ID_PREFIX = "dynamic-print-style-";

interface PrintOptions {
  /** Largura física da página: ex: "80mm" ou "210mm" (A4) */
  pageSize: string;
  /** Margem da página (CSS) */
  margin?: string;
  /** CSS adicional dentro de @media print */
  extraCss?: string;
  /** Espera N ms antes de chamar window.print() (para o browser aplicar o CSS) */
  delayMs?: number;
}

export function printWithStyle({
  pageSize,
  margin = "0",
  extraCss = "",
  delayMs = 50,
}: PrintOptions): void {
  const id = `${STYLE_ID_PREFIX}${Date.now()}`;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @page {
      size: ${pageSize} !important;
      margin: ${margin} !important;
    }
    @media print {
      html, body {
        width: ${pageSize === "auto" || pageSize.includes("auto") ? "100%" : pageSize} !important;
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      #app-root, #app-root *, header, aside, nav, button, .no-print {
        display: none !important;
        visibility: hidden !important;
      }
      #print-root, #print-root * {
        display: block !important;
        visibility: visible !important;
      }
      #print-root {
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: ${pageSize.includes("mm") && !pageSize.includes("auto") ? pageSize : "100%"} !important;
        max-width: none !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      ${extraCss}
    }
  `;
  document.head.appendChild(style);

  // Pequeno delay para o navegador aplicar o CSS
  setTimeout(() => {
    window.print();
    // Remove o style após a impressão terminar (ou cancelar)
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.remove();
    }, 1000);
  }, delayMs);
}

/** Limpa qualquer style de impressão residual (chame em onClose do modal) */
export function cleanupPrintStyles(): void {
  document.querySelectorAll<HTMLElement>(`[id^="${STYLE_ID_PREFIX}"]`).forEach((el) => el.remove());
}
