"use client";

/**
 * Helper para injetar @page e CSS de impressão específico antes de window.print().
 * O `#print-root` é compartilhado entre múltiplos modais (cupom 80mm, A4, etc.).
 * Cada modal aplica seu próprio @page / @media print só durante a impressão.
 */
const STYLE_ID_PREFIX = "dynamic-print-style-";

interface PrintOptions {
  /** Largura física da página: ex: "80mm" ou "A4" */
  pageSize: string;
  /** Margem da página (CSS shorthand) */
  margin?: string;
  /** CSS adicional dentro de @media print */
  extraCss?: string;
  /** Espera N ms antes de chamar window.print() (para o browser aplicar o CSS) */
  delayMs?: number;
  /** Se true, mostra um overlay "Preparando impressão..." enquanto aplica o CSS */
  showOverlay?: boolean;
}

export function printWithStyle({
  pageSize,
  margin = "0",
  extraCss = "",
  delayMs = 250,
  showOverlay = true,
}: PrintOptions): void {
  // Overlay visual opcional para o usuário ver que algo está acontecendo
  let overlay: HTMLDivElement | null = null;
  if (showOverlay) {
    overlay = document.createElement("div");
    overlay.id = "print-overlay-feedback";
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 600;
    `;
    overlay.innerHTML = `<div style="background:#1e293b; padding:20px 28px; border-radius:12px; display:flex; align-items:center; gap:12px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      Preparando impressão (${pageSize})...
    </div><style>@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(overlay);
  }

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
        width: ${pageSize === "A4" ? "210mm" : "100%"} !important;
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }
      #app-root, #app-root *, header, aside, nav, button, .no-print {
        display: none !important;
        visibility: hidden !important;
      }
      #print-root, #print-root * {
        visibility: visible !important;
      }
      #print-root {
        display: block !important;
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: ${pageSize === "A4" ? "210mm" : "100%"} !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      #print-overlay-feedback { display: none !important; }
      ${extraCss}
    }
  `;
  document.head.appendChild(style);

  // Espera o browser aplicar o CSS antes de chamar print
  setTimeout(() => {
    window.print();
    // Remove o overlay e o style após a impressão
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      const el = document.getElementById(id);
      if (el) el.remove();
    }, 1500);
  }, delayMs);
}

/** Limpa qualquer style de impressão residual (chame em onClose do modal) */
export function cleanupPrintStyles(): void {
  document.querySelectorAll<HTMLElement>(`[id^="${STYLE_ID_PREFIX}"]`).forEach((el) => el.remove());
  const overlay = document.getElementById("print-overlay-feedback");
  if (overlay) overlay.remove();
}
