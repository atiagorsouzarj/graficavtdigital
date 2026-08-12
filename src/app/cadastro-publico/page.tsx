"use client";

import React, { useState } from "react";
import { UserPlus, CheckCircle2, Sparkles } from "lucide-react";

export default function CadastroPublicoPage() {
  const [type, setType] = useState("PJ");
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name,
        tradeName,
        document,
        phone,
        email,
      }),
    });
    if (res.ok) {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-sky-600 rounded-2xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">CADASTRO DE CLIENTE</h1>
            <p className="text-xs text-sky-400">Gráfica Rápida & Papelaria Personalizada</p>
          </div>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-base text-white">Cadastro Realizado com Sucesso!</h3>
            <p className="text-xs text-slate-300">
              Seus dados fiscais e de contato foram salvos em nosso sistema.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("PJ")}
                className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                  type === "PJ" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                Pessoa Jurídica (PJ)
              </button>
              <button
                type="button"
                onClick={() => setType("PF")}
                className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                  type === "PF" ? "bg-sky-600 border-sky-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                Pessoa Física (PF)
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                {type === "PJ" ? "Razão Social" : "Nome Completo"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {type === "PJ" && (
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">{type === "PJ" ? "CNPJ" : "CPF"}</label>
                <input
                  type="text"
                  required
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">E-mail para Nota e Orçamentos</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer shadow-lg mt-2"
            >
              Concluir Meu Cadastro
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
