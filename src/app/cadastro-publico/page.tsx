"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  Phone,
  Mail,
  Send,
  Loader2,
  Sparkles,
  Printer,
  Gift,
  Box,
  Globe,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  validateCPF,
  validateCNPJ,
  validateEmail,
  fetchAddressByCEP,
  maskCPF,
  maskCNPJ,
  maskCEP,
  maskPhone,
  maskBirthDate,
} from "@/lib/validation";

export default function CadastroPublicoPage() {
  const router = useRouter();

  // Form Type
  const [type, setType] = useState<"PF" | "PJ">("PF");

  // Form Fields
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [document, setDocument] = useState("");
  const [stateRegistration, setStateRegistration] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Address
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Order Details
  const [neededProduct, setNeededProduct] = useState("Cartão de visita / papelaria comercial");
  const [orderDetails, setOrderDetails] = useState("");
  const [foundUs, setFoundUs] = useState("");

  // Opt-ins
  const [optWhatsapp, setOptWhatsapp] = useState(true);
  const [optEmail, setOptEmail] = useState(true);
  const [optCall, setOptCall] = useState(true);

  // Banner Carousel Index (0, 1, 2)
  const [bannerIndex, setBannerIndex] = useState(0);

  // States
  const [loadingCep, setLoadingCep] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Company Settings
  const [companySettings, setCompanySettings] = useState({
    name: "PRINTFLOW ART STUDIO",
    phone: "(11) 4002-8922",
    whatsapp: "(21) 97886-9414",
    instagram: "@printflow.oficial",
    website: "https://vtdigital.com.br",
  });

  const banners = [
    {
      title: "DESTAQUE: Personalizados sob medida",
      subtitle: "Gráfica rápida, brindes, papelaria e impressão 3D em alta definição.",
      color: "from-sky-700 to-indigo-900",
    },
    {
      title: "DESTAQUE: Qualidade Impressão Konica & Sublimação",
      subtitle: "Aprovamos a sua arte digital antes da impressão com entrega rápida.",
      color: "from-purple-800 to-slate-900",
    },
    {
      title: "DESTAQUE: Desconto no PIX & Faturamento PJ",
      subtitle: "Facilidade de pagamento com cashback e faturamento corporativo.",
      color: "from-emerald-700 to-slate-900",
    },
  ];

  // Auto-rotate Banners every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Company Settings
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.map) {
          const m = d.map;
          setCompanySettings({
            name: (m.company_name || "PRINTFLOW ART STUDIO").toUpperCase(),
            phone: m.company_phone || "(11) 4002-8922",
            whatsapp: m.company_whatsapp || "(21) 97886-9414",
            instagram: "@printflow.oficial",
            website: "https://vtdigital.com.br",
          });
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // ViaCEP Address Lookup
  const handleCepSearch = async () => {
    if (!zipCode) return;
    setLoadingCep(true);
    setErrorMsg("");
    const res = await fetchAddressByCEP(zipCode);
    setLoadingCep(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      if (res.address) setAddress(res.address);
      if (res.neighborhood) setNeighborhood(res.neighborhood);
      if (res.city) setCity(res.city);
      if (res.state) setState(res.state);
    }
  };

  const handleDocumentChange = (val: string) => {
    if (type === "PJ") {
      setDocument(maskCNPJ(val));
    } else {
      setDocument(maskCPF(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg(type === "PJ" ? "Informe a Razão Social." : "Informe o Nome Completo.");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setErrorMsg("Informe um e-mail válido.");
      return;
    }

    const docClean = document.replace(/\D/g, "");
    if (!docClean) {
      setErrorMsg(type === "PJ" ? "Informe o CNPJ." : "Informe o CPF.");
      return;
    }

    if (type === "PF" && !validateCPF(docClean)) {
      setErrorMsg("O CPF informado é inválido.");
      return;
    }

    if (type === "PJ" && !validateCNPJ(docClean)) {
      setErrorMsg("O CNPJ informado é inválido.");
      return;
    }

    setSubmitting(true);
    try {
      const notesFormatted = `[Solicitação Via Cadastro Público]\nProduto Necessário: ${neededProduct}\nDetalhes: ${orderDetails}\nOnde encontrou: ${foundUs}`;

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          tradeName: type === "PJ" ? tradeName : null,
          document,
          stateRegistration,
          birthDate,
          gender,
          zipCode,
          address,
          number,
          neighborhood,
          city,
          state,
          phone,
          mobile: phone,
          whatsapp: phone,
          email,
          foundUs,
          noAutoWhatsapp: !optWhatsapp,
          promoWhatsapp: optWhatsapp,
          promoEmail: optEmail,
          infoCall: optCall,
          clientStatus: "Liberado",
          notes: notesFormatted,
        }),
      });

      if (res.ok) {
        router.push("/cadastro-publico/obrigado");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erro ao enviar cadastro.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão ao enviar formulário.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-3 sm:p-6 lg:p-10 flex items-center justify-center">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in zoom-in-95 duration-150">
        
        {/* LEFT COLUMN: BRAND, FEATURE CARDS, ANIMATED BANNER & CONTACT INFO (Matching Screenshot) */}
        <div className="lg:col-span-5 bg-slate-50 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-600 rounded-xl text-white font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm tracking-wide">
                {companySettings.name}
              </span>
            </div>

            {/* Main Heading matching Screenshot */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-sky-600 tracking-wider block">
                {companySettings.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Cadastro rápido.<br />Orçamento na hora.
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Preencha seus dados e receba um atendimento mais rápido.
              </p>
            </div>

            {/* 3 Service Feature Cards matching Screenshot */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 block text-xs">Gráfica rápida</strong>
                  <span className="text-[11px] text-slate-500">
                    Cartões, flyers, banners, adesivos e grandes formatos
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 block text-xs">Papelaria personalizada</strong>
                  <span className="text-[11px] text-slate-500">
                    Convites, lembrancinhas, canecas e brindes
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 block text-xs">Impressão 3D & DTF</strong>
                  <span className="text-[11px] text-slate-500">
                    Peças sob demanda, estamparia DTF e miniaturas
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                SIGA A GENTE NAS REDES
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/55${companySettings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold cursor-pointer transition-colors"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href={companySettings.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl font-bold cursor-pointer transition-colors"
                  title="Website Oficial"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Animated Banner Carousel (3 Banners sliding) matching Screenshot */}
            <div
              className={`p-4 rounded-2xl bg-gradient-to-r ${banners[bannerIndex].color} text-white shadow-md space-y-1.5 transition-all duration-500`}
            >
              <span className="text-[10px] font-black uppercase text-amber-300 block tracking-wider">
                {banners[bannerIndex].title}
              </span>
              <p className="text-xs font-semibold leading-snug">
                {banners[bannerIndex].subtitle}
              </p>
              <div className="flex gap-1.5 pt-1 justify-center">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      bannerIndex === idx ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Contact Bottom Box */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-bold text-slate-800">Fale com a gente</span>
            <span className="font-mono font-black text-sky-700">
              📞 {companySettings.phone}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: PUBLIC CLIENT FORM FOR PF AND PJ (Matching Screenshot) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Type Selector Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("PF");
                  setDocument("");
                }}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === "PF"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <User className="w-4 h-4" /> Pessoa Física
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("PJ");
                  setDocument("");
                }}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === "PJ"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" /> Pessoa Jurídica
              </button>
            </div>

            {/* Row 1: Name & Document */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  {type === "PJ" ? "Razão social completa *" : "Nome completo *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  {type === "PJ" ? "CNPJ *" : "CPF *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                  value={document}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Row 2: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  WhatsApp / telefone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="(11) 99999-8888"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {type === "PF" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Data de nascimento</label>
                  <input
                    type="text"
                    placeholder="dd/mm/aaaa"
                    value={birthDate}
                    onChange={(e) => setBirthDate(maskBirthDate(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Sexo</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                  >
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Inscrição Estadual</label>
                  <input
                    type="text"
                    value={stateRegistration}
                    onChange={(e) => setStateRegistration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Address Block with ViaCEP Search */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">CEP</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(maskCEP(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-mono outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCepSearch}
                    disabled={loadingCep}
                    className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl font-bold cursor-pointer shrink-0 transition-colors"
                  >
                    {loadingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-extrabold text-slate-700 block mb-1">Endereço</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Número</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Bairro</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">UF</label>
                <input
                  type="text"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 uppercase font-bold text-center outline-hidden"
                />
              </div>
            </div>

            {/* Order Request Section matching Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">O que você precisa?</label>
                <select
                  value={neededProduct}
                  onChange={(e) => setNeededProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold outline-hidden"
                >
                  <option value="Cartão de visita / papelaria comercial">Cartão de visita / papelaria comercial</option>
                  <option value="Papelaria personalizada / Festas">Papelaria personalizada / Festas</option>
                  <option value="Banners / Adesivos Comunicação Visual">Banners / Adesivos Comunicação Visual</option>
                  <option value="Serviço DTF (UV ou Têxtil)">Serviço DTF (UV ou Têxtil)</option>
                  <option value="Brindes e Canecas">Brindes e Canecas</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Detalhes do pedido</label>
                <textarea
                  rows={2}
                  placeholder="Quantidade, material, tamanho e acabamento..."
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Onde você nos encontrou?</label>
              <select
                value={foundUs}
                onChange={(e) => setFoundUs(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
              >
                <option value="">Selecione...</option>
                <option value="Instagram">Instagram</option>
                <option value="Google / Busca">Google / Busca</option>
                <option value="Indicação">Indicação de Amigo/Cliente</option>
                <option value="Passagem em Loja">Passagem em Loja</option>
              </select>
            </div>

            {/* Checkboxes matching Screenshot */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 block font-bold">Autorizações promocionais (opcional)</span>
              <div className="flex flex-wrap gap-4 text-slate-700 font-medium text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optWhatsapp}
                    onChange={(e) => setOptWhatsapp(e.target.checked)}
                    className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>WhatsApp</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optEmail}
                    onChange={(e) => setOptEmail(e.target.checked)}
                    className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>E-mail</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optCall}
                    onChange={(e) => setOptCall(e.target.checked)}
                    className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>Ligações</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{submitting ? "Enviando..." : "Enviar cadastro →"}</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center italic">
              Seus dados serão usados para atendimento e orçamento conforme a LGPD.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
