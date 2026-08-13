"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Printer,
  ArrowRight,
  Loader2,
  Mail,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

function VerificarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doc = searchParams.get("doc") || "";
  const redirect = searchParams.get("redirect") || "/cliente/dashboard";
  const codeFromQuery = searchParams.get("code") || "";

  const [code, setCode] = useState(
    codeFromQuery.length === 6
      ? codeFromQuery.split("")
      : ["", "", "", "", "", ""]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!doc) router.push("/cliente/login");
  }, [doc, router]);

  const handleCodeChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    // Auto-focus no próximo
    if (value && idx < 5) {
      const next = document.getElementById(`code-${idx + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      const prev = document.getElementById(`code-${idx - 1}`);
      prev?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const finalCode = code.join("");
    if (finalCode.length !== 6) {
      setError("Digite os 6 dígitos do código.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cliente/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: doc, code: finalCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código inválido.");
        setCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
        return;
      }
      // Sucesso! Redireciona
      router.push(redirect);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setResendSuccess(false);
    try {
      const res = await fetch("/api/cliente/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: doc }),
      });
      if (res.ok) {
        setResendSuccess(true);
        setCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao reenviar.");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setResending(false);
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
          <Link href="/cliente/login" className="text-xs text-slate-300 hover:text-white font-medium">
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black">Confirme seu código</h1>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Enviamos um código de 6 dígitos para o seu e-mail
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

              {resendSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Novo código enviado para o seu e-mail.</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block text-center">
                  Digite o código de 6 dígitos
                </label>
                <div className="flex justify-center gap-2">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-12 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.join("").length !== 6}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    Entrar <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[10px] text-slate-500">
                  Não recebeu o código?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 mx-auto disabled:opacity-50"
                >
                  <RotateCcw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                  {resending ? "Reenviando..." : "Reenviar código"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ClienteVerificarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    }>
      <VerificarContent />
    </Suspense>
  );
}
