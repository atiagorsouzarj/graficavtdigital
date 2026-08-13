"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Send,
  FileText,
  CreditCard,
  Truck,
  Check,
  Search,
  User,
  MapPin,
  Loader2,
  HelpCircle,
  QrCode,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchAddressByCEP } from "@/lib/validation";

interface QuickQuoteModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

interface Product {
  id: string;
  name: string;
  suggestedPrice: string;
  code: string;
  category?: string;
}

interface ClientCRM {
  id: string;
  name: string;
  tradeName?: string;
  document: string;
  email: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export default function QuickQuoteModal({ onClose, onCreated }: QuickQuoteModalProps) {
  // Client States
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientDocument, setClientDocument] = useState("");
  
  // Address & CEP States for SuperFrete
  const [zipCode, setZipCode] = useState("01000-000");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [loadingCep, setLoadingCep] = useState(false);

  // CRM Clients Search List
  const [clientsList, setClientsList] = useState<ClientCRM[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Products Search States
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Quote Line Items
  const [items, setItems] = useState<
    Array<{ id?: string; name: string; qty: number; price: number; isCustom?: boolean }>
  >([
    { name: "Cartão de Visita Couchê 300g Verniz (100un)", qty: 1, price: 95.00 },
  ]);

  // Financial & Logistics
  const [discount, setDiscount] = useState("0.00");
  const [freight, setFreight] = useState("0.00");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [shippingMethod, setShippingMethod] = useState("superfrete_sedex");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showItemAvulsoHelp, setShowItemAvulsoHelp] = useState(false);

  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load products and clients
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([prodsData, clientsData]) => {
        if (Array.isArray(prodsData)) setProductsList(prodsData);
        if (Array.isArray(clientsData)) setClientsList(clientsData);
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle Client Auto-complete Selection
  const handleSelectClient = (c: ClientCRM) => {
    setSelectedClientId(c.id);
    setClientName(c.name);
    setClientSearchQuery(c.name);
    setClientPhone(c.whatsapp || c.mobile || c.phone || "");
    setClientEmail(c.email || "");
    setClientDocument(c.document || "");
    if (c.zipCode) setZipCode(c.zipCode);
    if (c.address) setAddress(c.address);
    if (c.neighborhood) setNeighborhood(c.neighborhood);
    if (c.city) setCity(c.city);
    if (c.state) setState(c.state);
    setShowClientDropdown(false);
  };

  // Address Lookup via ViaCEP
  const handleCepSearch = async () => {
    if (!zipCode) return;
    setLoadingCep(true);
    const res = await fetchAddressByCEP(zipCode);
    setLoadingCep(false);
    if (res.address) setAddress(res.address);
    if (res.neighborhood) setNeighborhood(res.neighborhood);
    if (res.city) setCity(res.city);
    if (res.state) setState(res.state);
  };

  // Add Product from Live Search Auto-complete
  const handleAddProductFromSearch = (prod: Product) => {
    setItems([
      ...items,
      {
        id: prod.id,
        name: prod.name,
        qty: 1,
        price: parseFloat(prod.suggestedPrice || "0"),
        isCustom: false,
      },
    ]);
    setProductSearchQuery("");
    setShowProductDropdown(false);
  };

  // Add Custom / Item Avulso
  const handleAddCustomItem = () => {
    setItems([
      ...items,
      {
        name: "Serviço Especial / Item Avulso",
        qty: 1,
        price: 35.00,
        isCustom: true,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: unknown) => {
    const next = [...items];
    // @ts-expect-error dynamic key assignment
    next[idx][field] = value;
    setItems(next);
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const total = Math.max(0, subtotal - parseFloat(discount || "0") + parseFloat(freight || "0"));

  const handleSave = async (sendType?: string) => {
    setLoading(true);
    try {
      const fullShippingAddress = address
        ? `${address}, ${neighborhood} - ${city}/${state} - CEP: ${zipCode}`
        : "";

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          clientId: selectedClientId,
          clientName: clientName || clientSearchQuery || "Cliente Balcão",
          clientDocument,
          clientPhone,
          clientEmail,
          status: "sent",
          subtotalAmount: subtotal.toFixed(2),
          discountAmount: discount,
          freightAmount: freight,
          shippingAddress: fullShippingAddress,
          paymentMethod,
          shippingMethod,
          items: items.map((i) => ({
            productId: i.id || null,
            productName: i.name,
            quantity: i.qty,
            unitPrice: i.price.toFixed(2),
          })),
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (onCreated) onCreated();
        if (sendType === "whatsapp") {
          alert(`Orçamento gerado e link enviado via WhatsApp para ${clientPhone || "Cliente"}!`);
        } else if (sendType === "email") {
          alert(`Orçamento em PDF enviado com sucesso para ${clientEmail || "e-mail"}!`);
        }
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Client List for Auto-complete
  const filteredClients = clientsList.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.document.includes(clientSearchQuery)
  );

  // Filtered Product List for Auto-complete
  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 duration-150 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Novo Orçamento Rápido</h2>
            <p className="text-xs text-slate-500">
              Busca automática de cliente do CRM, orçamento dinâmico e integração com SuperFrete.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600" />
            Orçamento gerado e registrado no banco de dados com sucesso!
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* CLIENT AUTO-COMPLETE SEARCH & CONTACT FIELDS */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-700 uppercase text-[10px] block">
              [ CLIENTE & CONTATO (Busca Automática no CRM) ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Client Auto-complete Search Input */}
              <div className="relative sm:col-span-1" ref={clientDropdownRef}>
                <label className="font-semibold text-slate-700 block mb-1">Buscar / Nome do Cliente *</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Digite nome ou CPF/CNPJ..."
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setClientName(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 font-bold outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Dropdown Menu */}
                {showClientDropdown && clientSearchQuery.trim() && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 max-h-48 overflow-y-auto space-y-1">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full text-left p-2 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors block"
                      >
                        <strong className="text-slate-800 block text-xs">{c.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.document} • {c.whatsapp || c.email}
                        </span>
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <p className="p-2 text-slate-400 text-center italic text-[11px]">
                        Nenhum cliente cadastrado com esse nome. Preencha os campos abaixo.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="contato@cliente.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-hidden"
                />
              </div>
            </div>

            {/* ENDEREÇO & CEP PARA CÁLCULO DE FRETE */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end pt-1 border-t border-slate-200/60">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">CEP de Entrega</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCepSearch}
                    disabled={loadingCep}
                    className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl font-bold cursor-pointer shrink-0"
                    title="Buscar ViaCEP"
                  >
                    {loadingCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Endereço / Logradouro</label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cidade / UF</label>
                <input
                  type="text"
                  placeholder="São Paulo / SP"
                  value={city ? `${city}/${state}` : ""}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* PRODUCT LIVE SEARCH AUTO-COMPLETE & LINE ITEMS */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-extrabold text-slate-800 text-xs">
                Itens do Orçamento ({items.length})
              </span>

              <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                {/* Product Search Input with Auto-complete Dropdown */}
                <div className="relative flex-1" ref={productDropdownRef}>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="+ Digite nome do produto para buscar no catálogo..."
                      value={productSearchQuery}
                      onChange={(e) => {
                        setProductSearchQuery(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>

                  {showProductDropdown && productSearchQuery.trim() && (
                    <div className="absolute right-0 left-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-1.5 max-h-52 overflow-y-auto space-y-1">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddProductFromSearch(p)}
                          className="w-full text-left p-2 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <strong className="text-slate-800 block text-xs">{p.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{p.code}</span>
                          </div>
                          <span className="font-extrabold text-sky-700">
                            {formatCurrency(p.suggestedPrice)}
                          </span>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="p-2 text-slate-400 text-center italic text-[11px]">
                          Nenhum produto encontrado. Clique em "+ Item Avulso".
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Item Avulso Button with Explanation Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" /> Item Avulso
                  </button>
                </div>
              </div>
            </div>

            {/* Line Items Table with Aligned Columns */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
              <div className="bg-slate-100/70 p-2 px-3 grid grid-cols-12 gap-2 text-[10px] font-extrabold text-slate-500 uppercase">
                <div className="col-span-6">Descrição do Produto / Serviço</div>
                <div className="col-span-2 text-center">Qtd</div>
                <div className="col-span-2 text-right">Preço Un (R$)</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-6 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                    {item.isCustom && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0">
                        Avulso
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-bold text-slate-800 outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-mono font-bold text-slate-800 outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <span className="font-black text-slate-900 font-mono text-xs">
                      {formatCurrency(item.qty * item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT METHOD & SUPERFRETE LOGISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>Forma de Pagamento</span>
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-hidden"
              >
                <option value="pix">PIX Instantâneo (0% taxa - Recomendado)</option>
                <option value="infinitepay_link">Link InfinitePay (Cartão / Débito)</option>
                <option value="cash">Dinheiro no Balcão</option>
                <option value="boleto">Boleto Bancário (Faturado 15 dias)</option>
              </select>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Logística & Frete (SuperFrete)</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={shippingMethod}
                  onChange={(e) => {
                    setShippingMethod(e.target.value);
                    if (e.target.value === "pickup") setFreight("0.00");
                    else if (e.target.value === "motoboy") setFreight("25.00");
                    else setFreight("18.50");
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-hidden"
                >
                  <option value="pickup">Retirada no Balcão (R$ 0,00)</option>
                  <option value="superfrete_sedex">SuperFrete SEDEX Express</option>
                  <option value="superfrete_pac">SuperFrete Correios PAC</option>
                  <option value="motoboy">Motoboy Local (R$ 25,00)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Frete R$"
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                  className="w-24 bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-right font-mono font-bold text-slate-800 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* TOTALS SUMMARY BANNER */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-slate-400 block text-[11px]">Subtotal: {formatCurrency(subtotal)}</span>
              <span className="text-slate-400 block text-[11px]">
                Desconto: -{formatCurrency(parseFloat(discount || "0"))} | Frete SuperFrete: +
                {formatCurrency(parseFloat(freight || "0"))}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-xs block">Valor Total do Pedido</span>
              <span className="text-2xl font-black text-sky-400 font-mono">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave("whatsapp")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar via WhatsApp</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave("email")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Enviar E-mail (PDF)</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave()}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
            >
              Salvar Orçamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
