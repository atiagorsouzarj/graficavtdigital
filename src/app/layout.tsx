import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintFlow Gráfica Criativa - ERP CRM",
  description: "Sistema ERP, CRM e Precificação para Gráfica Rápida e Papelaria Personalizada.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <div id="app-root">{children}</div>
        <div id="print-root"></div>
      </body>
    </html>
  );
}
