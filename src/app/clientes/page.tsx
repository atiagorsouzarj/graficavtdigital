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
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'PF', 'PJ'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'Liberado', 'Bloqueado', 'Especial', 'VIP'
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
            <h1 className="text-2xl font-bold text-slate-800">CRM — Cadastro de Clientes</h1>
            <p className="text-xs text-slate-500">
              Gerencie contatos de Pessoa Física (CPF) e Pessoa Jurídica (CNPJ), localização via ViaCEP, redes sociais e limites de crédito.
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Novo Cliente (CRM)
          </button>
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
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-hidden"
            >
              <option value="all">Todos os Tipos (PF / PJ)</option>
              <option value="PJ">Pessoa Jurídica (PJ)</option>
              <option value="PF">Pessoa Física (PF)</option>
            </select>

            {/* Status Filter */}
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
                  <th className="p-3 text-center">Ações</th>
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

                    <td className="p-3 font-mono font-semibold text-slate-700">
                      {formatCPFOrCNPJ(c.document)}
                    </td>

                    <td className="p-3 text-slate-600">
                      <div>{formatPhone(c.whatsapp || c.mobile || c.phone)}</div>
                      <span className="text-[10px] text-slate-400 block">{c.email}</span>
                    </td>

                    <td className="p-3 text-slate-600">
                      {c.city ? `${c.city} / ${c.state}` : "—"}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.clientStatus === "Bloqueado"
                            ? "bg-red-100 text-red-800"
                            : c.clientStatus === "VIP"
                            ? "bg-purple-100 text-purple-800"
                            : c.clientStatus === "Especial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.clientStatus || "Liberado"}
                      </span>
                    </td>

                    <td className="p-3 text-right font-bold text-emerald-700">
                      {formatCurrency(c.creditLimit)}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                          title="Editar Cadastro CRM"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Excluir Cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <CrmClientModal
          initialData={selectedClient}
          onClose={() => setShowModal(false)}
          onSaved={fetchClients}
        />
      )}
    </MainLayout>
  );
}
