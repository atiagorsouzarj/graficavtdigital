"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRightLeft,
  ShoppingCart,
  PieChart,
  Calendar,
  Building2,
  CheckCircle,
  FileText,
  CreditCard,
  ChevronRight,
  Filter,
} from "lucide-react";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

interface Transaction {
  id: string;
  code: string;
  description: string;
  type: string;
  category: string;
  accountName: string;
  dueDate: string;
  amount: string;
  status: string;
  paymentMethod: string;
}

interface FinancialAccount {
  id: string;
  name: string;
  type: string;
  balance: string;
}

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState("visao_geral");
  const [inadimplenciaTab, setInadimplenciaTab] = useState("<7d");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showNewTransModal, setShowNewTransModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New transaction state
  const [newTransDesc, setNewTransDesc] = useState("");
  const [newTransAmount, setNewTransAmount] = useState("");
  const [newTransType, setNewTransType] = useState("income");
  const [newTransAccount, setNewTransAccount] = useState("");

  // Transfer state
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const fetchData = async () => {
    try {
      const [resTrans, resAcc] = await Promise.all([
        fetch("/api/financial/transactions"),
        fetch("/api/financial/accounts"),
      ]);
      const dataTrans = await resTrans.json();
      const dataAcc = await resAcc.json();

      if (Array.isArray(dataTrans)) setTransactions(dataTrans);
      if (Array.isArray(dataAcc)) {
        setAccounts(dataAcc);
        if (dataAcc.length >= 2) {
          setTransferFrom(dataAcc[0].name);
          setTransferTo(dataAcc[1].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((acc, a) => acc + parseFloat(a.balance || "0"), 0);

  const handleCreateTrans = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransDesc || !newTransAmount) return;

    await fetch("/api/financial/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newTransDesc,
        amount: newTransAmount,
        type: newTransType,
        accountName: newTransAccount || "Caixa Loja",
        category: newTransType === "income" ? "Venda Balcão" : "Despesa Operacional",
        status: "paid",
      }),
    });

    setNewTransDesc("");
    setNewTransAmount("");
    setShowNewTransModal(false);
    fetchData();
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || !transferAmount) return;

    // Outflow from origin
    await fetch("/api/financial/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `Transferência enviada para ${transferTo}`,
        amount: transferAmount,
        type: "expense",
        accountName: transferFrom,
        category: "Transferência Entre Contas",
        status: "paid",
      }),
    });

    // Inflow to destination
    await fetch("/api/financial/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `Transferência recebida de ${transferFrom}`,
        amount: transferAmount,
        type: "income",
        accountName: transferTo,
        category: "Transferência Entre Contas",
        status: "paid",
      }),
    });

    setShowTransferModal(false);
    setTransferAmount("");
    fetchData();
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header Header Subtitle */}
        <div>
          <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider">
            FLUXO DE CAIXA, DRE E TESOURARIA
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-0.5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
              <p className="text-xs text-slate-500">
                Contas bancárias, centros de custo, DRE, inadimplência e cobrança automática.
              </p>
            </div>

            {/* Top Action Buttons matching photo 01 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova conta</span>
              </button>

              <button
                onClick={() => setShowNewTransModal(true)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo lançamento</span>
              </button>

              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transferir</span>
              </button>

              <a
                href="/pdv"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Abrir caixa PDV</span>
              </a>
            </div>
          </div>
        </div>

        {/* Top Header Tabs matching Photo 01 */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex flex-wrap gap-1 text-xs font-medium">
          {[
            { id: "visao_geral", label: "Visão geral" },
            { id: "contas_pagar_receber", label: "Contas a pagar/receber" },
            { id: "fluxo_caixa", label: "Fluxo de caixa" },
            { id: "dre", label: "DRE e relatórios" },
            { id: "centros", label: "Contas e centros" },
            { id: "cobranca", label: "Cobrança" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-sky-100 text-sky-800 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 6 Top Metric Cards matching Photo 01 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Card 1: SALDO EM CONTAS */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SALDO EM CONTAS</span>
            </div>
            <div className="text-lg font-extrabold text-slate-800">{formatCurrency(totalBalance || 8327.0)}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Saldo real disponível</span>
          </div>

          {/* Card 2: A RECEBER */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">A RECEBER</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-600">{formatCurrency(0.0)}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">0 títulos pendentes</span>
          </div>

          {/* Card 3: A PAGAR */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">A PAGAR</span>
            </div>
            <div className="text-lg font-extrabold text-red-600">{formatCurrency(420.0)}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">1 títulos pendentes</span>
          </div>

          {/* Card 4: SALDO PROJETADO */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SALDO PROJETADO</span>
            </div>
            <div className="text-lg font-extrabold text-slate-800">{formatCurrency(7907.0)}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Considerando pendentes</span>
          </div>

          {/* Card 5: INADIMPLÊNCIA */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">INADIMPLÊNCIA</span>
            </div>
            <div className="text-lg font-extrabold text-slate-800">{formatCurrency(0.0)}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">0 clientes em atraso</span>
          </div>

          {/* Card 6: META DO MÊS */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">META DO MÊS</span>
            </div>
            <div className="text-lg font-extrabold text-indigo-600">41%</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">R$ 10.250 de R$ 25.000</span>
          </div>
        </div>

        {/* Bank Accounts Section & Warning Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bank Account Boxes (Caixa Loja, Banco Inter, InfinitePay, VTO Digital) */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Contas bancárias</span>
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
              >
                Ver extrato
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Caixa Loja */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">CAIXA</span>
                <span className="font-bold text-slate-800 text-xs block mt-0.5">Caixa Loja</span>
                <span className="text-sm font-black text-sky-700 mt-2 block">
                  {formatCurrency(accounts.find((a) => a.name.includes("Caixa"))?.balance || 3558.0)}
                </span>
              </div>

              {/* Banco Inter */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">BANCO</span>
                <span className="font-bold text-slate-800 text-xs block mt-0.5">Banco Inter</span>
                <span className="text-sm font-black text-sky-700 mt-2 block">
                  {formatCurrency(accounts.find((a) => a.name.includes("Inter"))?.balance || 4636.5)}
                </span>
              </div>

              {/* InfinitePay */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ADQUIRENTE</span>
                <span className="font-bold text-slate-800 text-xs block mt-0.5">InfinitePay</span>
                <span className="text-sm font-black text-sky-700 mt-2 block">
                  {formatCurrency(accounts.find((a) => a.name.includes("Infinite"))?.balance || 2132.5)}
                </span>
              </div>

              {/* VTO Digital */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">VTO DIGITAL</span>
                <span className="font-bold text-slate-800 text-xs block mt-0.5">Saldo</span>
                <span className="text-sm font-black text-slate-400 mt-2 block">{formatCurrency(0.0)}</span>
              </div>
            </div>

            {/* Warning Alert Banner matching Photo 01 */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Vencendo em breve:</strong>
                <span>1 lançamento(s) pendentes nos próximos 7 dias. (Insumos de Lona R$ 420,00)</span>
              </div>
            </div>

            {/* Inadimplência aging tabs */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                AGINGO DA INADIMPLÊNCIA
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {[
                  { id: "<7d", label: "<7 dias", val: "R$ 0,00" },
                  { id: "7-15d", label: "7-15 dias", val: "R$ 0,00" },
                  { id: "15-30d", label: "15-30 dias", val: "R$ 0,00" },
                  { id: "30-60d", label: "30-60 dias", val: "R$ 0,00" },
                  { id: ">60d", label: ">60 dias", val: "R$ 0,00" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setInadimplenciaTab(item.id)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      inadimplenciaTab === item.id
                        ? "bg-amber-100/60 border-amber-300 font-bold text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block text-[10px] text-slate-500">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.val}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formas de Recebimento breakdown matching photo 01 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
              Formas de recebimento
            </span>

            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28 rounded-full border-8 border-sky-500 border-t-emerald-500 border-r-purple-500 border-l-amber-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500 text-center">
                  100%<br />Recebido
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> PIX
                </span>
                <span className="font-bold text-slate-800">{formatCurrency(1048.5)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Cartão de crédito
                </span>
                <span className="font-bold text-slate-800">{formatCurrency(252.5)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Boleto
                </span>
                <span className="font-bold text-slate-800">{formatCurrency(0.0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Dinheiro
                </span>
                <span className="font-bold text-slate-800">{formatCurrency(228.0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lançamentos Recentes Table matching Photo 01 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Lançamentos recentes</h2>
              <p className="text-[11px] text-slate-500">28 registros • Saldo projetado: {formatCurrency(7907.0)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-slate-200">
                <Filter className="w-3.5 h-3.5" /> Filtrar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Lançamento</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Conta</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{t.description}</div>
                      <span className="text-[10px] text-slate-400 font-normal">SPOP • PDV</span>
                    </td>
                    <td className="p-3 text-slate-500">{t.category || "—"}</td>
                    <td className="p-3 text-slate-700 font-medium">{t.accountName}</td>
                    <td className="p-3 text-slate-500">{formatDateOnly(t.dueDate)}</td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      <span className={`font-semibold mr-1 ${t.type === "expense" ? "text-red-500" : "text-emerald-600"}`}>
                        {t.type === "expense" ? "▼" : "▲"}
                      </span>
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Pago
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => alert(`Receibo / Comprovante do lançamento ${t.code}`)}
                        className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 rounded-md text-[11px] text-slate-700 font-medium cursor-pointer"
                      >
                        Receber
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Transaction Modal */}
      {showNewTransModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Lançamento Financeiro</h3>
            <form onSubmit={handleCreateTrans} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de Papel Couché 300g"
                  value={newTransDesc}
                  onChange={(e) => setNewTransDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={newTransAmount}
                    onChange={(e) => setNewTransAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo</label>
                  <select
                    value={newTransType}
                    onChange={(e) => setNewTransType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                  >
                    <option value="income">Entrada (Receita)</option>
                    <option value="expense">Saída (Despesa)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Conta Bancária</label>
                <select
                  value={newTransAccount}
                  onChange={(e) => setNewTransAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTransModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Transferência Entre Contas</h3>
            <form onSubmit={handleTransfer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Conta de Origem (Saída)</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Conta de Destino (Entrada)</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-bold"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Valor da Transferência (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden font-mono font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
                >
                  Executar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Account Modal */}
      {showNewAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Nova Conta / Gateway</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome da Conta</label>
                <input
                  type="text"
                  placeholder="Ex: PagSeguro / Itaú / Cofre"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-hidden"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAccountModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Nova conta criada!");
                    setShowNewAccountModal(false);
                  }}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
                >
                  Cadastrar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
