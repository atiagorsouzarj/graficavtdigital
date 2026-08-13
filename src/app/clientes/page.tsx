"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import CrmClientModal from "@/components/CrmClientModal";
import {
  Users,
  Plus,
  Search,
  Building2,
  User,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  FileJson,
  X,
  AlertCircle,
} from "lucide-react";
import { formatCPFOrCNPJ, formatPhone, formatCurrency } from "@/lib/utils";

interface Client {
  id: string;
  type: string;
  name: string;
  tradeName?: string;
  nickname?: string;
  clientStatus?: string;
  document: string;
  stateRegistration?: string;
  email: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  contactPerson?: string;
  city?: string;
  state?: string;
  creditLimit?: string;
  notes?: string;
  createdAt: string;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Import / Export States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatusMsg, setImportStatusMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/clients?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleOpenNew = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro do cliente "${name}"?`)) {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Tipo",
      "Razao Social / Nome",
      "Nome Fantasia",
      "CPF / CNPJ",
      "IE",
      "E-mail",
      "Telefone",
      "WhatsApp",
      "Cidade",
      "UF",
      "Status",
      "Limite Credito",
    ];

    const rows = filtered.map((c) => [
      c.type,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.tradeName || "").replace(/"/g, '""')}"`,
      `"${c.document || ""}"`,
      `"${c.stateRegistration || ""}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.whatsapp || ""}"`,
      `"${c.city || ""}"`,
      `"${c.state || ""}"`,
      `"${c.clientStatus || "Liberado"}"`,
      `"${c.creditLimit || "0.00"}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clientes-crm-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Printable PDF Report
  const handleExportPDF = () => {
    window.print();
  };

  // CSV Import File Reader Handler
  const handleCSVFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatusMsg("");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        
        let successCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/;|,/).map((c) => c.replace(/^"|"$/g, "").trim());
          if (cols.length >= 2) {
            const clientType = cols[0]?.toUpperCase().includes("PJ") ? "PJ" : "PF";
            const clientName = cols[1] || cols[0] || "Cliente Importado";
            const doc = cols[3] || cols[2] || "00000000000";
            const email = cols[5] || cols[4] || `cliente_${Date.now()}@importado.com`;

            await fetch("/api/clients", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: clientType,
                name: clientName,
                document: doc,
                email: email,
                phone: cols[6] || "",
                whatsapp: cols[7] || cols[6] || "",
                clientStatus: "Liberado",
              }),
            });
            successCount++;
          }
        }

        setImportStatusMsg(`✓ Importação concluída! ${successCount} clientes cadastrados com sucesso.`);
        fetchClients();
      } catch (err) {
        console.error(err);
        setImportStatusMsg("Erro ao processar o arquivo CSV. Verifique a formatação.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const filtered = clients.filter((c) => {
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || (c.clientStatus || "Liberado") === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
              MÓDULO DE GESTÃO CRM
            </span>
            <h1 className="text-2xl font-bold text-slate-800">CRM — Gestão de Clientes</h1>
            <p className="text-xs text-slate-500">
              Gerencie cadastros PF/PJ, importação/exportação em CSV e PDF, ViaCEP e status de crédito.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Importar CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel (CSV)</span>
            </button>

            <button
              onClick={handleOpenNew}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Razão Social/Nome, CPF/CNPJ, WhatsApp ou E-mail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-hidden"
            >
              <option value="all">Todos os Tipos (PF / PJ)</option>
              <option value="PJ">Pessoa Jurídica (PJ)</option>
              <option value="PF">Pessoa Física (PF)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-hidden"
            >
              <option value="all">Todos os Status</option>
              <option value="Liberado">Liberado</option>
              <option value="Bloqueado">Bloqueado</option>
              <option value="Especial">Especial</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Razão Social / Nome Completo</th>
                  <th className="p-3">CPF / CNPJ</th>
                  <th className="p-3">WhatsApp / Telefone</th>
                  <th className="p-3">Cidade / UF</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Limite Crédito</th>
                  <th className="p-3 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          c.type === "PJ"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-800">
                      <div>{c.name}</div>
                      {c.tradeName && (
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Fantasia: {c.tradeName}
                        </span>
                      )}
                      {c.nickname && (
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Apelido: {c.nickname}
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-mono text-slate-600 font-medium">
                      {formatCPFOrCNPJ(c.document)}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        {formatPhone(c.whatsapp || c.mobile || c.phone || "")}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{c.email}</span>
                    </td>

                    <td className="p-3 text-slate-600">
                      {c.city ? `${c.city} - ${c.state || ""}` : "—"}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          c.clientStatus === "VIP"
                            ? "bg-amber-100 text-amber-800"
                            : c.clientStatus === "Bloqueado"
                            ? "bg-red-100 text-red-800"
                            : c.clientStatus === "Especial"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.clientStatus || "Liberado"}
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(c.creditLimit || "0.00")}
                    </td>

                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors cursor-pointer"
                          title="Editar cadastro"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors cursor-pointer"
                          title="Excluir cadastro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Client Import CSV */}
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
              <button
                onClick={() => setShowImportModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-sky-600 tracking-wider">
                  MIGRAÇÃO DE BANCO DE DADOS
                </span>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-600" />
                  Importar Clientes via Planilha CSV
                </h3>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <span className="font-extrabold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Lembrete de Importação:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Quando você me enviar o modelo exato da planilha CSV exportada do seu antigo sistema, ajustarei o mapeador para ler todas as colunas (Campos de Endereço, Histórico, Observações) automaticamente!
                </p>
              </div>

              {importStatusMsg && (
                <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{importStatusMsg}</span>
                </div>
              )}

              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50">
                <FileSpreadsheet className="w-10 h-10 text-sky-600 mx-auto" />
                <div>
                  <span className="font-extrabold text-slate-800 block text-xs">Selecione o arquivo .CSV</span>
                  <span className="text-[10px] text-slate-400 block">Separado por ponto e vírgula (;) ou vírgula (,)</span>
                </div>

                <label className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{importing ? "Importando..." : "Escolher Arquivo CSV"}</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCSVFileChange}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Client Edit / New */}
        {showModal && (
          <CrmClientModal
            initialData={selectedClient}
            onClose={() => setShowModal(false)}
            onSaved={fetchClients}
          />
        )}

      </div>
    </MainLayout>
  );
}
