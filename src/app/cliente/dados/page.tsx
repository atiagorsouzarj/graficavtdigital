"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Smartphone,
} from "lucide-react";
import ClientAreaLayout from "@/components/ClientAreaLayout";
import { formatCPFOrCNPJ, formatPhone } from "@/lib/utils";

interface ClientData {
  id: string;
  name: string;
  email: string;
  type: string;
  document: string;
  phone?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
}

export default function ClienteDadosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);

  useEffect(() => {
    fetch("/api/cliente/me")
      .then((r) => r.json())
      .then((me) => {
        if (me.error) {
          router.push("/cliente/login?redirect=/cliente/dados");
          return;
        }
        setClient(me);
        setLoading(false);
      })
      .catch(() => router.push("/cliente/login"));
  }, [router]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  const rows = [
    {
      icon: User,
      label: "Nome / Razão Social",
      value: client.name,
    },
    {
      icon: FileText,
      label: client.type === "PJ" ? "CNPJ" : "CPF",
      value: formatCPFOrCNPJ(client.document),
    },
    {
      icon: Mail,
      label: "E-mail",
      value: client.email,
    },
    {
      icon: Phone,
      label: "Telefone fixo",
      value: formatPhone(client.phone),
    },
    {
      icon: Smartphone,
      label: "Celular",
      value: formatPhone(client.mobile || client.whatsapp),
    },
    {
      icon: MapPin,
      label: "Cidade / UF",
      value: [client.city, client.state].filter(Boolean).join(" / ") || "-",
    },
  ];

  return (
    <ClientAreaLayout clientName={client.name}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Meus Dados</h1>
          <p className="text-xs text-slate-500">
            Informações cadastrais da sua conta junto à gráfica.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {rows.map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                      {row.label}
                    </div>
                    <div className="text-sm font-bold text-slate-800 truncate">
                      {row.value || "-"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
          <p>
            Precisa alterar algum dado? Entre em contato com a gráfica pelo
            WhatsApp ou e-mail para solicitar a atualização do cadastro.
          </p>
        </div>
      </div>
    </ClientAreaLayout>
  );
}
