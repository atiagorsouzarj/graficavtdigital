"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  Lock,
  FileText,
  Search,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  { id: "cartao-visita", label: "Cartão de Visita" },
  { id: "panfleto", label: "Panfleto / Flyer" },
  { id: "banner", label: "Banner / Lona" },
  { id: "adesivo", label: "Adesivo / Vinil" },
  { id: "sublimacao", label: "Sublimação" },
  { id: "comunicacao-visual", label: "Comunicação Visual" },
  { id: "outros", label: "Outros" },
];

const FILE_TYPES = [
  { id: "pdf", label: "PDF" },
  { id: "cdr", label: "CorelDRAW (.cdr)" },
  { id: "ai", label: "Illustrator (.ai)" },
  { id: "psd", label: "Photoshop (.psd)" },
  { id: "jpg", label: "JPG" },
  { id: "png", label: "PNG" },
  { id: "svg", label: "SVG" },
];

interface Gabarito {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  category: string;
  productType?: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  widthMm?: number | null;
  heightMm?: number | null;
  bleedMm: number;
  requiresAuth: boolean;
  downloads: number;
  active: boolean;
}

interface FormState {
  code: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeKb: string;
  widthMm: string;
  heightMm: string;
  bleedMm: string;
  requiresAuth: boolean;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  title: "",
  description: "",
  category: "cartao-visita",
  fileUrl: "",
  fileName: "",
  fileType: "pdf",
  fileSizeKb: "0",
  widthMm: "",
  heightMm: "",
  bleedMm: "3",
  requiresAuth: false,
  active: true,
};

const formatSize = (kb: number) => {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function GabaritosSettings() {
  const [loading, setLoading] = useState(true);
  const [gabaritos, setGabaritos] = useState<Gabarito[]>([]);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Gabarito | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/gabaritos?admin=1");
      const d = await r.json();
      setGabaritos(Array.isArray(d) ? d : []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = gabaritos.filter((g) => {
    if (filter !== "todos" && g.category !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        g.title.toLowerCase().includes(s) ||
        g.code.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setCreating(true);
  };

  const startEdit = (g: Gabarito) => {
    setForm({
      code: g.code,
      title: g.title,
      description: g.description || "",
      category: g.category,
      fileUrl: g.fileUrl,
      fileName: g.fileName,
      fileType: g.fileType,
      fileSizeKb: String(g.fileSizeKb || 0),
      widthMm: g.widthMm ? String(g.widthMm) : "",
      heightMm: g.heightMm ? String(g.heightMm) : "",
      bleedMm: String(g.bleedMm || 3),
      requiresAuth: g.requiresAuth,
      active: g.active,
    });
    setEditing(g);
    setCreating(true);
  };

  const cancelForm = () => {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const save = async () => {
    if (!form.code || !form.title || !form.fileUrl || !form.fileName) {
      setMsg({ type: "error", text: "Preencha code, title, fileUrl e fileName." });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description || null,
        category: form.category,
        fileUrl: form.fileUrl,
        fileName: form.fileName,
        fileType: form.fileType,
        fileSizeKb: form.fileSizeKb || 0,
        widthMm: form.widthMm || null,
        heightMm: form.heightMm || null,
        bleedMm: form.bleedMm || 3,
        requiresAuth: form.requiresAuth,
        ...(editing ? { active: form.active } : {}),
      };

      const url = editing ? `/api/gabaritos/${editing.id}` : "/api/gabaritos";
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg({ type: "error", text: d.error || "Erro ao salvar." });
        return;
      }
      setMsg({ type: "success", text: editing ? "Gabarito atualizado!" : "Gabarito criado!" });
      cancelForm();
      await load();
    } catch (err) {
      setMsg({ type: "error", text: "Erro de conexão." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (g: Gabarito) => {
    if (!confirm(`Excluir o gabarito "${g.title}"?`)) return;
    try {
      const r = await fetch(`/api/gabaritos/${g.id}`, { method: "DELETE" });
      if (r.ok) {
        setMsg({ type: "success", text: `Gabarito "${g.title}" excluído.` });
        await load();
      } else {
        const d = await r.json();
        setMsg({ type: "error", text: d.error || "Erro ao excluir." });
      }
    } catch {
      setMsg({ type: "error", text: "Erro de conexão." });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {msg && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 text-sm font-semibold ${
            msg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Gabaritos
            </h3>
            <p className="text-xs text-slate-500">
              Modelos oficiais (PDF, CDR, AI, PSD, JPG, PNG, SVG) que aparecem em{" "}
              <code className="bg-slate-100 px-1 rounded">/cliente/gabaritos</code> e no Portal.
            </p>
          </div>
          <button
            onClick={startCreate}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novo Gabarito
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar gabarito..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilter("todos")}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                filter === "todos" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Todos ({gabaritos.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = gabaritos.filter((g) => g.category === c.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                    filter === c.id ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulário de criação/edição */}
        {creating && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800">
                {editing ? `Editar: ${editing.title}` : "Novo Gabarito"}
              </h4>
              <button
                onClick={cancelForm}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Código único *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={Boolean(editing)}
                  placeholder="cartao-visita-pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono outline-hidden focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Cartão de Visita 9x5cm Couchê 300g"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Descrição</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Modelo padrão CMYK com sangria de 3mm"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Categoria *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Tipo de Arquivo *</label>
                <select
                  value={form.fileType}
                  onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  {FILE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">URL do Arquivo *</label>
                <input
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://exemplo.com/gabarito.pdf ou /uploads/cartao.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nome do Arquivo *</label>
                <input
                  value={form.fileName}
                  onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                  placeholder="cartao-visita-padrao.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Tamanho (KB)</label>
                <input
                  type="number"
                  value={form.fileSizeKb}
                  onChange={(e) => setForm({ ...form, fileSizeKb: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Largura (mm)</label>
                <input
                  type="number"
                  value={form.widthMm}
                  onChange={(e) => setForm({ ...form, widthMm: e.target.value })}
                  placeholder="85"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Altura (mm)</label>
                <input
                  type="number"
                  value={form.heightMm}
                  onChange={(e) => setForm({ ...form, heightMm: e.target.value })}
                  placeholder="55"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Sangria (mm)</label>
                <input
                  type="number"
                  value={form.bleedMm}
                  onChange={(e) => setForm({ ...form, bleedMm: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requiresAuth}
                    onChange={(e) => setForm({ ...form, requiresAuth: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Lock className="w-3 h-3" /> Exige login para baixar
                  </span>
                </label>
                {editing && (
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-700">Ativo (visível no portal)</span>
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancelForm}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Tabela */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum gabarito cadastrado. Clique em "Novo Gabarito" para começar.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
            {filtered.map((g) => (
              <div key={g.id} className="p-3 flex items-center gap-3 hover:bg-slate-50">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800 truncate">{g.title}</span>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      .{g.fileType.toUpperCase()}
                    </span>
                    {g.requiresAuth && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Login
                      </span>
                    )}
                    {!g.active && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    <code className="font-mono">{g.code}</code> • {formatSize(g.fileSizeKb || 0)} • 📥 {g.downloads} downloads
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={g.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    title="Visualizar"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => startEdit(g)}
                    className="p-1.5 bg-slate-100 hover:bg-amber-100 text-amber-700 rounded-lg"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(g)}
                    className="p-1.5 bg-slate-100 hover:bg-red-100 text-red-700 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
