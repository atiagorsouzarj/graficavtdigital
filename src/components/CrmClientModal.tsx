"use client";

import React, { useState } from "react";
import {
  X,
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

interface CrmClientModalProps {
  initialData?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function CrmClientModal({
  initialData,
  onClose,
  onSaved,
}: CrmClientModalProps) {
  const [type, setType] = useState<"PF" | "PJ">(initialData?.type || "PJ");
  const [subTab, setSubTab] = useState<"contacts" | "notes">("contacts");

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [tradeName, setTradeName] = useState(initialData?.tradeName || "");
  const [nickname, setNickname] = useState(initialData?.nickname || "");
  const [clientStatus, setClientStatus] = useState(initialData?.clientStatus || "Liberado");

  const [document, setDocument] = useState(
    initialData?.document
      ? initialData.type === "PJ"
        ? maskCNPJ(initialData.document)
        : maskCPF(initialData.document)
      : ""
  );
  const [stateRegistration, setStateRegistration] = useState(
    initialData?.stateRegistration || ""
  );
  const [birthDate, setBirthDate] = useState(
    initialData?.birthDate ? maskBirthDate(initialData.birthDate) : ""
  );
  const [gender, setGender] = useState(initialData?.gender || "");

  const [contactPerson, setContactPerson] = useState(
    initialData?.contactPerson || ""
  );
  const [originMarketing, setOriginMarketing] = useState(
    initialData?.originMarketing || ""
  );
  const [foundUs, setFoundUs] = useState(initialData?.foundUs || "");
  const [segment, setSegment] = useState(initialData?.segment || "");

  // Address
  const [zipCode, setZipCode] = useState(
    initialData?.zipCode ? maskCEP(initialData.zipCode) : ""
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [number, setNumber] = useState(initialData?.number || "");
  const [complement, setComplement] = useState(initialData?.complement || "");
  const [neighborhood, setNeighborhood] = useState(
    initialData?.neighborhood || ""
  );
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");

  // Contacts
  const [phone, setPhone] = useState(
    initialData?.phone ? maskPhone(initialData.phone) : ""
  );
  const [mobile, setMobile] = useState(
    initialData?.mobile ? maskPhone(initialData.mobile) : ""
  );
  const [whatsapp, setWhatsapp] = useState(
    initialData?.whatsapp ? maskPhone(initialData.whatsapp) : ""
  );
  const [email, setEmail] = useState(initialData?.email || "");

  // Rules
  const [noAutoWhatsapp, setNoAutoWhatsapp] = useState(
    Boolean(initialData?.noAutoWhatsapp)
  );
  const [promoWhatsapp, setPromoWhatsapp] = useState(
    initialData?.promoWhatsapp !== undefined ? Boolean(initialData?.promoWhatsapp) : true
  );
  const [promoEmail, setPromoEmail] = useState(
    initialData?.promoEmail !== undefined ? Boolean(initialData?.promoEmail) : true
  );
  const [infoCall, setInfoCall] = useState(
    initialData?.infoCall !== undefined ? Boolean(initialData?.infoCall) : true
  );

  const [notes, setNotes] = useState(initialData?.notes || "");

  // Errors and Loading
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);

  // Address lookup via ViaCEP
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg(
        type === "PJ"
          ? "Por favor informe a Razão Social."
          : "Por favor informe o Nome Completo."
      );
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Por favor informe o E-mail.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("O E-mail informado é inválido.");
      return;
    }

    const docClean = document.replace(/\D/g, "");
    if (!docClean) {
      setErrorMsg(type === "PJ" ? "Por favor informe o CNPJ." : "Por favor informe o CPF.");
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

    setSaving(true);
    try {
      const url = initialData?.id
        ? `/api/clients/${initialData.id}`
        : "/api/clients";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          tradeName,
          nickname,
          clientStatus,
          document,
          stateRegistration,
          birthDate,
          gender,
          contactPerson,
          originMarketing,
          foundUs,
          segment,
          zipCode,
          address,
          number,
          complement,
          neighborhood,
          city,
          state,
          phone,
          mobile,
          whatsapp,
          email,
          noAutoWhatsapp,
          promoWhatsapp,
          promoEmail,
          infoCall,
          notes,
        }),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Erro ao salvar cliente.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-4">
        {/* Header matching Screenshot */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-sky-600 tracking-wider block">
              CRM • CADASTRO COMPLETO
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              {initialData?.id ? "Editar cliente" : "Novo cliente"}
            </h2>
            <p className="text-xs text-slate-400">
              Dados pessoais, endereço, redes sociais e regras de contato.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Top Row: Type Selector Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("PF");
                setDocument("");
              }}
              className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                type === "PF"
                  ? "bg-sky-500 text-white shadow-xs"
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
              className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                type === "PJ"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4" /> Pessoa Jurídica
            </button>
          </div>

          {/* Row 2: Name / Razão Social & Client Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                {type === "PJ" ? "RAZÃO SOCIAL COMPLETA *" : "NOME COMPLETO *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1 uppercase text-[10px]">
                SEGUINDO O CLIENTE / TIPO
              </label>
              <select
                value={clientStatus}
                onChange={(e) => setClientStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Liberado">Liberado</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Especial">Especial</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          {/* Sub-tabs matching Screenshots */}
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setSubTab("contacts")}
              className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                subTab === "contacts"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Endereço e contatos
            </button>

            <button
              type="button"
              onClick={() => setSubTab("notes")}
              className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                subTab === "notes"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Informações / observações
            </button>
          </div>

          {subTab === "contacts" ? (
            <>
              {/* SECTION: IDENTIFICAÇÃO E RELACIONAMENTO */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                  IDENTIFICAÇÃO E RELACIONAMENTO
                </span>

                {type === "PJ" ? (
                  /* PJ Fields */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          NOME FANTASIA
                        </label>
                        <input
                          type="text"
                          value={tradeName}
                          onChange={(e) => setTradeName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          ORIGEM / MARKETING
                        </label>
                        <select
                          value={originMarketing}
                          onChange={(e) => setOriginMarketing(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                        >
                          <option value="">—</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Google">Google / Busca</option>
                          <option value="Indicação">Indicação de Cliente</option>
                          <option value="Panfleto">Panfleto / Balcão</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          PESSOA DE CONTATO
                        </label>
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          ONDE NOS ENCONTROU
                        </label>
                        <select
                          value={foundUs}
                          onChange={(e) => setFoundUs(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                        >
                          <option value="">—</option>
                          <option value="Redes Sociais">Redes Sociais</option>
                          <option value="Passagem Balcão">Passagem em Loja</option>
                          <option value="Evento">Evento / Feira</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          CNPJ *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="00.000.000/0000-00"
                          value={document}
                          onChange={(e) => handleDocumentChange(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono font-bold outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          INSCRIÇÃO ESTADUAL
                        </label>
                        <input
                          type="text"
                          value={stateRegistration}
                          onChange={(e) => setStateRegistration(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                        SEGMENTO
                      </label>
                      <select
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                      >
                        <option value="">—</option>
                        <option value="Gastronomia">Gastronomia / Restaurantes</option>
                        <option value="Eventos">Eventos & Festas</option>
                        <option value="Comércio">Comércio / Varejo</option>
                        <option value="Corporativo">Corporativo / Escritórios</option>
                        <option value="Agência">Agência de Publicidade</option>
                      </select>
                    </div>
                  </>
                ) : (
                  /* PF Fields */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          APELIDO
                        </label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          ORIGEM / MARKETING
                        </label>
                        <select
                          value={originMarketing}
                          onChange={(e) => setOriginMarketing(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                        >
                          <option value="">—</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Google">Google / Busca</option>
                          <option value="Indicação">Indicação de Amigo</option>
                          <option value="Balcão">Atendimento no Balcão</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          PESSOA DE CONTATO
                        </label>
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          ONDE NOS ENCONTROU
                        </label>
                        <select
                          value={foundUs}
                          onChange={(e) => setFoundUs(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                        >
                          <option value="">—</option>
                          <option value="Redes Sociais">Redes Sociais</option>
                          <option value="Fachada Loja">Fachada de Loja</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          CPF *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          value={document}
                          onChange={(e) => handleDocumentChange(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono font-bold outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                          DATA DE NASCIMENTO
                        </label>
                        <input
                          type="text"
                          placeholder="dd/mm/aaaa"
                          value={birthDate}
                          onChange={(e) => setBirthDate(maskBirthDate(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                        SEXO
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                      >
                        <option value="">—</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro / Não Informar</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* SECTION: ENDEREÇO (ViaCEP) */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                  ENDEREÇO
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      CEP
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="00000-000"
                        value={zipCode}
                        onChange={(e) => setZipCode(maskCEP(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleCepSearch}
                        disabled={loadingCep}
                        className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl font-bold cursor-pointer shrink-0 transition-colors"
                        title="Buscar endereço no ViaCEP"
                      >
                        {loadingCep ? (
                          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      NOME DA RUA / AVENIDA
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      NÚMERO
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      COMPLEMENTO
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      BAIRRO
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      CIDADE
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      UF
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 uppercase text-center font-bold outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: CONTATOS */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                  CONTATOS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      TELEFONE (FIXO)
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 4002-8922"
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      Nº CELULAR
                    </label>
                    <input
                      type="text"
                      placeholder="(21) 9xxxx-xxxx"
                      value={mobile}
                      onChange={(e) => setMobile(maskPhone(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                      WHATSAPP
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 99999-8888"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-600 block mb-1 text-[10px] uppercase">
                    E-MAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* SUBTAB: INFORMAÇÕES / OBSERVAÇÕES */
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                INFORMAÇÕES E HISTÓRICO
              </span>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações Internas</label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotações sobre regras de faturamento, prazos de entrega preferenciais ou restrições do cliente..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Bottom Checkboxes for Contact Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={noAutoWhatsapp}
                onChange={(e) => setNoAutoWhatsapp(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Não autoriza mensagens automáticas de WhatsApp</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={promoWhatsapp}
                onChange={(e) => setPromoWhatsapp(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Promoções via WhatsApp</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={promoEmail}
                onChange={(e) => setPromoEmail(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Promoções por e-mail</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infoCall}
                onChange={(e) => setInfoCall(e.target.checked)}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Informações por ligação</span>
            </label>
          </div>

          <p className="text-[10px] text-sky-600 italic">
            Validação local de documento + busca de endereço via ViaCEP.
          </p>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Sair
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "✓ Salvar cadastro"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
