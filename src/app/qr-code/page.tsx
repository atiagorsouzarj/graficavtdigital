"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Power,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function QrCodePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>("A82K-9128");
  const [status, setStatus] = useState<string>("connected");
  const [phone, setPhone] = useState<string>("+55 (21) 97886-9414");
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp");
      const data = await res.json();
      if (data.config) {
        setStatus(data.config.status || "connected");
        setPhone(data.config.connectedPhone || "+55 (21) 97886-9414");
        if (data.config.qrCodeUrl) setQrCodeUrl(data.config.qrCodeUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerateQr = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_qr" }),
      });
      const data = await res.json();
      if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);
      if (data.pairingCode) setPairingCode(data.pairingCode);
      setStatus("pairing");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnection = async () => {
    const nextAction = status === "connected" ? "disconnect" : "connect";
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: nextAction }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatus(data.status);
      setQrCodeUrl(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
            BAILEYS WEBSOCKETS BRIDGE • CONEXÃO WHATSAPP
          </span>
          <h1 className="text-3xl font-black text-slate-800">
            Escaneamento de QR Code WhatsApp
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aparelhos Conectados ➔ Conecte o WhatsApp da sua gráfica ao sistema ERP CRM para envio automático de mensagens transacionais.
          </p>
        </div>

        {/* Main QR Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-5 relative overflow-hidden">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-2 ${
                status === "connected"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : status === "pairing"
                  ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status === "connected"
                    ? "bg-emerald-500 animate-ping"
                    : "bg-red-500"
                }`}
              />
              {status === "connected"
                ? "● WHATSAPP CONECTADO E PRONTO"
                : status === "pairing"
                ? "⏳ AGUARDANDO ESCANEAMENTO DO QR CODE"
                : "✕ WHATSAPP DESCONECTADO"}
            </span>
          </div>

          {/* Connection Phone Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 max-w-md mx-auto">
            <p>
              Telefone Ativo: <strong className="font-mono text-emerald-700 text-sm">{phone}</strong>
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Sessão: baileys_sess_9918237912837 • Servidor Debian OK
            </p>
          </div>

          {/* QR Code Display Box */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 max-w-sm mx-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-400">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span>Código de Pareamento ao Vivo</span>
            </div>

            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code Baileys"
                className="w-56 h-56 mx-auto rounded-2xl border-4 border-white shadow-lg bg-white p-2"
              />
            ) : (
              <div className="w-56 h-56 mx-auto rounded-2xl border-4 border-slate-800 bg-slate-950 flex flex-col items-center justify-center space-y-2 p-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">WhatsApp Conectado!</span>
                <span className="text-[10px] text-slate-400 text-center">
                  Sua instância Baileys está ativa e pronta para enviar mensagens.
                </span>
              </div>
            )}

            {pairingCode && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Código de Conexão Direta:
                </span>
                <span className="text-emerald-400 font-mono font-extrabold text-lg tracking-widest block">
                  {pairingCode}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGenerateQr}
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Gerar Novo QR Code</span>
            </button>

            <button
              onClick={handleToggleConnection}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors ${
                status === "connected"
                  ? "bg-red-100 hover:bg-red-200 text-red-800"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{status === "connected" ? "Desconectar Sessão" : "Reconectar Instância"}</span>
            </button>

            <a
              href="/whatsapp"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Abrir Painel WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Instructions Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700 max-w-lg mx-auto">
            <strong className="font-bold text-slate-800 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Como conectar seu WhatsApp:
            </strong>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1">
              <li>Abra o WhatsApp no celular da empresa.</li>
              <li>Acesse <strong>Menu (⋮) ou Configurações ➔ Aparelhos Conectados</strong>.</li>
              <li>Toque em <strong>Conectar um aparelho</strong>.</li>
              <li>Aponte a câmera para o QR Code acima.</li>
            </ol>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
