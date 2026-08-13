"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Download,
  FileText,
  Layers,
  Printer,
  Image as ImageIcon,
  FileImage,
  FileType,
  Lock,
  Search,
  ChevronLeft,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";

interface Gabarito {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  widthMm?: number | null;
  heightMm?: number | null;
  bleedMm: number;
  requiresAuth: boolean;
  downloads: number;
}

const CATEGORIES: { id: string; label: string; icon: any; color: string }[] = [
  { id: "todos", label: "Todos", icon: Layers, color: "bg-slate-100 text-slate-700" },
  { id: "cartao-visita", label: "Cartão de Visita", icon: FileText, color: "bg-sky-100 text-sky-700" },
  { id: "panfleto", label: "Panfleto / Flyer", icon: FileText, color: "bg-emerald-100 text-emerald-700" },
  { id: "banner", label: "Banner / Lona", icon: ImageIcon, color: "bg-purple-100 text-purple-700" },
  { id: "adesivo", label: "Adesivo / Vinil", icon: FileImage, color: "bg-amber-100 text-amber-700" },
  { id: "sublimacao", label: "Sublimação", icon: Printer, color: "bg-rose-100 text-rose-700" },
  { id: "comunicacao-visual", label: "Comunicação Visual", icon: Layers, color: "bg-indigo-100 text-indigo-700" },
  { id: "outros", label: "Outros", icon: FileType, color: "bg-slate-100 text-slate-700" },
];

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700 border-red-300",
  cdr: "bg-amber-100 text-amber-700 border-amber-300",
  ai: "bg-orange-100 text-orange-700 border-orange-300",
  psd: "bg-blue-100 text-blue-700 border-blue-300",
  jpg: "bg-emerald-100 text-emerald-700 border-emerald-300",
  png: "bg-cyan-100 text-cyan-700 border-cyan-300",
  svg: "bg-purple-100 text-purple-700 border-purple-300",
};

const formatSize = (kb: number) => {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function ClienteGabaritosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [gabaritos, setGabaritos] = useState<Gabarito[]>([]);
  const [category, setCategory] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/cliente/me").then((r) => r.json()),
      fetch("/api/gabaritos").then((r) => r.json()),
    ])
      .then(([me, list]) => {
        if (!me.error) setClient(me);
        setGabaritos(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = gabaritos.filter((g) => {
    if (category !== "todos" && g.category !== category) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        g.title.toLowerCase().includes(s) ||
        g.code.toLowerCase().includes(s) ||
        (g.description || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleDownload = async (g: Gabarito) => {
    if (g.requiresAuth && !client) {
      router.push("/cliente/login?redirect=/cliente/gabaritos");
      return;
    }
    try {
      await fetch(`/api/gabaritos/${g.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download" }),
      });
    } catch (err) {
      console.error(err);
    }
    window.open(g.fileUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <ClientAreaLayout clientName={client?.name || "Visitante"}>
      <div className="space-y-5">
        <div>
          <Link
            href="/portal"
            className="text-xs text-slate-500 hover:text-sky-600 font-bold flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="w-3 h-3" /> Voltar ao Portal
          </Link>
          <h1 className="text-2xl font-black text-slate-800">Central de Gabaritos</h1>
          <p className="text-xs text-slate-500">
            Modelos oficiais em PDF, CorelDRAW, AI e PSD com sangria configurada.
            Use como base para criar suas artes sem risco de corte.
          </p>
        </div>

        {!client && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">Você está navegando como visitante</p>
              <p className="text-xs text-amber-800">
                Alguns gabaritos exigem login.{" "}
                <Link href="/cliente/login?redirect=/cliente/gabaritos" className="font-bold underline">
                  Entrar na minha conta
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = c.id === "todos" ? gabaritos.length : gabaritos.filter((g) => g.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  category === c.id
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gabarito por título ou código..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhum gabarito encontrado.</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente outra categoria ou peça à gráfica que adicione o gabarito.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const fileColor = FILE_TYPE_COLORS[g.fileType] || "bg-slate-100 text-slate-700 border-slate-300";
              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${fileColor}`}
                      >
                        .{g.fileType.toUpperCase()}
                      </span>
                      {g.requiresAuth && (
                        <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Login
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">
                      {g.title}
                    </h3>
                    {g.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        {g.description}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                      {g.widthMm && g.heightMm && (
                        <div>📐 {g.widthMm}×{g.heightMm}mm • Sangria {g.bleedMm}mm</div>
                      )}
                      <div>💾 {formatSize(g.fileSizeKb || 0)}</div>
                      <div>📥 {g.downloads} downloads</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(g)}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar Gabarito
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClientAreaLayout>
  );
}
