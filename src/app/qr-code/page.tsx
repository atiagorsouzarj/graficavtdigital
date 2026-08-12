'use client';

import { useState, useEffect } from 'react';

export default function QRCodePage() {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    generateQR();
  }, []);

  const generateQR = async () => {
    setStatus('generating');
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_qr' }),
      });
      const data = await response.json();
      setQRCode(data.qrCodeUrl);
      setPairing(data.status === 'pairing');
      setStatus('success');
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">
          Conectar WhatsApp
        </h1>
        <p className="text-center text-slate-600 mb-6">
          Escaneie o código QR com seu celular
        </p>

        <div className="bg-slate-100 rounded-lg p-6 flex items-center justify-center min-h-80 mb-6">
          {qrCode ? (
            <img
              src={qrCode}
              alt="WhatsApp QR Code"
              className="w-full max-w-xs"
            />
          ) : (
            <div className="text-center">
              <p className="text-slate-600">Gerando QR Code...</p>
            </div>
          )}
        </div>

        <button
          onClick={generateQR}
          disabled={status === 'generating'}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {status === 'generating' ? 'Regenerando...' : 'Regenerar QR Code'}
        </button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Passos:</strong>
          </p>
          <ol className="text-sm text-blue-900 mt-2 space-y-1 list-decimal list-inside">
            <li>Abra WhatsApp no seu celular</li>
            <li>Toque em <strong>Configurações → Conectados</strong></li>
            <li>Selecione <strong>Conectar um dispositivo</strong></li>
            <li>Escaneie este QR Code</li>
            <li>A conexão será estabelecida automaticamente</li>
          </ol>
        </div>

        {pairing && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-900">
              ⏳ <strong>Modo pareamento ativo</strong>
              <br />
              Aguardando escaneamento do QR Code...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
