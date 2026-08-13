"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Printer,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { maskCPF, maskCNPJ } from "@/lib/validation";

function ClienteLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const novo = searchParams.get("novo") === "1";
  const docFromQuery = searchParams.get("doc") || "";
  const demoOtp = searchParams.get("demo_otp"); // OTP pré-preenchido em modo demo

  const [doc, setDoc] = useState(docFromQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ maskedEmail: string; expiresIn: number; mode: string; demoCode?: string } | null>(null);

  const handleDocChange = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 11) setDoc(maskCPF(value));
    else setDoc(maskCNPJ(value));
  };

  // Se veio demo_otp, pula para a tela de verificação com o código pré-preenchido
  useEffect(() => {
    if (demoOtp && doc) {
      const params = new URLSearchParams();
      params.set("doc", doc);
      params.set("code", demoOtp);
      if (redirect) params.set("redirect", redirect);
      router.push(`/cliente/verificar?${params.toString()}`);
    }
  }, [demoOtp, doc, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/cliente/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: doc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar código.");
        return;
      }
      setSuccess({
        maskedEmail: data.sentTo,
        expiresIn: data.expiresInMinutes,
        mode: data.mode,
      });
      const params = new URLSearchParams();
      params.set("doc", doc);
      if (redirect) params.set("redirect", redirect);
      setTimeout(() => {
        router.push(`/cliente/verificar?${params.toString()}`);
      }, 1500);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base tracking-wide bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                PrintFlow
              </span>
              <span className="text-[10px] font-bold text-sky-400 block tracking-widest uppercase">
                Área do Cliente
              </span>
            </div>
          </Link>
          <Link href="/portal" className="text-xs text-slate-300 hover:text-white font-medium">
            ← Voltar ao Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-4">
          {novo && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Cadastro realizado com sucesso!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Vamos enviar um código de acesso para o seu e-mail.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black">Acessar minha conta</h1>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Digite seu CPF ou CNPJ para receber um código de acesso
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Código enviado!</p>
                    <p className="text-xs mt-0.5">
                      Enviamos para <strong>{success.maskedEmail}</strong>. Válido por {success.expiresIn} min.
                    </p>
                    {success.mode === "logged" && (
                      <p className="text-[10px] text-amber-700 mt-1">
                        ⚠ SMTP não configurado — código salvo no log do sistema.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  value={doc}
                  onChange={(e) => handleDocChange(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  maxLength={18}
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-base font-bold font-mono outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !doc}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando código...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" /> Enviar código por e-mail
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Você receberá um código de 6 dígitos no e-mail cadastrado.
                  <br />
                  Válido por 5 minutos. Não compartilhe com ninguém.
                </p>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Ainda não é cliente?{" "}
              <Link
                href="/cadastro-publico"
                className="text-sky-600 hover:text-sky-700 font-bold underline"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ClienteLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    }>
      <ClienteLoginContent />
    </Suspense>
  );
}
