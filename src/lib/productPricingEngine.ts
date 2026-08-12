export interface ProductComponentItem {
  id: string;
  category: "insumo" | "maquina" | "mao_obra" | "embalagem" | "nenhum";
  sku: string;
  name: string;
  unit: string;
  quantityConsumed: number;
  unitCost: number;
}

export interface QuantityTierDiscount {
  minQty: number;
  discountPercent: number;
}

export interface ProductCompositionData {
  salesUnit: string;
  yieldPerA3Sheet: number;
  yieldFactor: number;
  
  lossMarginPercent: number;
  taxPercent: number;
  cardTaxPercent: number;
  targetMarginPercent: number;
  
  components: ProductComponentItem[];
  quantityTiers?: QuantityTierDiscount[];
}

export interface ProductPricingCalculationResult {
  baseCompositionCost: number;
  lossMarginAmount: number;
  costWithLoss: number;
  
  suggestedPrice: number;
  minSellPrice: number;
  
  profitAmount: number;
  profitRealPercent: number;
  taxAmount: number;
  cardTaxAmount: number;

  quantityTierTable: Array<{
    qty: number;
    discountPercent: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

// Matrix of Yield Factors per Sheet Formats (A4, A3, A3+ and None)
export const YIELD_MATRIX_PRESETS = [
  { label: "Não Aplicável (Sem Matriz / Serviço Livre)", yieldPerSheet: 1, factor: 1.0000 },
  { label: "Cartão de Visita (9x5 cm) — A3", yieldPerSheet: 24, factor: 0.0416 },
  { label: "Etiqueta Redonda (5x5 cm) — A3", yieldPerSheet: 40, factor: 0.0250 },
  { label: "Etiqueta Redonda (4x4 cm) — A3", yieldPerSheet: 54, factor: 0.0185 },
  { label: "Etiqueta Redonda (3x3 cm) — A3", yieldPerSheet: 108, factor: 0.0092 },
  { label: "Panfleto / Folder A5 (15x21 cm) — A4", yieldPerSheet: 2, factor: 0.5000 },
  { label: "Panfleto / Folder A5 (15x21 cm) — A3", yieldPerSheet: 4, factor: 0.2500 },
  { label: "Panfleto / Folder A5 (15x21 cm) — A3+", yieldPerSheet: 5, factor: 0.2000 },
  { label: "Caixa Cone / Pirâmide (15x10 cm aberta) — A3", yieldPerSheet: 1, factor: 1.0000 },
];

export const DEFAULT_PRODUCT_COMPOSITIONS: Record<string, ProductCompositionData> = {
  cartao_visita: {
    salesUnit: "CT",
    yieldPerA3Sheet: 24,
    yieldFactor: 0.0416,
    lossMarginPercent: 5.00,
    taxPercent: 6.00,
    cardTaxPercent: 3.16,
    targetMarginPercent: 60.00,
    quantityTiers: [
      { minQty: 100, discountPercent: 0 },
      { minQty: 500, discountPercent: 15 },
      { minQty: 1000, discountPercent: 25 },
      { minQty: 5000, discountPercent: 35 },
    ],
    components: [
      {
        id: "c1",
        category: "insumo",
        sku: "INS-PAP-COU300",
        name: "Papel Couché 300g Brilho 66x96cm",
        unit: "FLS",
        quantityConsumed: 4.1600,
        unitCost: 1.85,
      },
      {
        id: "c2",
        category: "maquina",
        sku: "MAQ-KONICA-A3",
        name: "Impressão Konica Minolta Duplex (8.32 cliques)",
        unit: "CLQ",
        quantityConsumed: 8.3200,
        unitCost: 0.1341,
      },
      {
        id: "c3",
        category: "mao_obra",
        sku: "MDO-REFIL-GUILH",
        name: "Tempo de Refile (Guilhotina 5 min)",
        unit: "MIN",
        quantityConsumed: 5.0000,
        unitCost: 0.15,
      },
      {
        id: "c4",
        category: "embalagem",
        sku: "EMB-CX-CARTAO",
        name: "Caixa Plástica para 100un",
        unit: "UN",
        quantityConsumed: 1.0000,
        unitCost: 0.40,
      },
    ],
  },

  etiqueta_5cm: {
    salesUnit: "UN",
    yieldPerA3Sheet: 40,
    yieldFactor: 0.0250,
    lossMarginPercent: 5.00,
    taxPercent: 6.00,
    cardTaxPercent: 3.16,
    targetMarginPercent: 65.00,
    quantityTiers: [
      { minQty: 100, discountPercent: 0 },
      { minQty: 500, discountPercent: 10 },
      { minQty: 1000, discountPercent: 20 },
      { minQty: 5000, discountPercent: 30 },
    ],
    components: [
      {
        id: "e1",
        category: "insumo",
        sku: "INS-VIN-BRI60",
        name: "Vinil Adesivo Brilho Bobina 60cm x 50m",
        unit: "FLS",
        quantityConsumed: 0.0250,
        unitCost: 7.00,
      },
      {
        id: "e2",
        category: "maquina",
        sku: "MAQ-KONICA-A3",
        name: "Impressão Konica Simplex",
        unit: "CLQ",
        quantityConsumed: 0.0250,
        unitCost: 0.1341,
      },
      {
        id: "e3",
        category: "maquina",
        sku: "MAQ-PLOTTER-REC",
        name: "Recorte Eletrônico Plotter (0.2 min)",
        unit: "MIN",
        quantityConsumed: 0.2000,
        unitCost: 0.10,
      },
    ],
  },

  caixa_cone: {
    salesUnit: "UN",
    yieldPerA3Sheet: 1,
    yieldFactor: 1.0000,
    lossMarginPercent: 5.00,
    taxPercent: 6.00,
    cardTaxPercent: 3.16,
    targetMarginPercent: 60.00,
    quantityTiers: [
      { minQty: 10, discountPercent: 0 },
      { minQty: 50, discountPercent: 10 },
      { minQty: 100, discountPercent: 18 },
      { minQty: 500, discountPercent: 28 },
    ],
    components: [
      {
        id: "x1",
        category: "insumo",
        sku: "INS-PAP-OFF180A4",
        name: "Papel Offset 180g A4",
        unit: "FLS",
        quantityConsumed: 1.0000,
        unitCost: 0.85,
      },
      {
        id: "x2",
        category: "maquina",
        sku: "MAQ-KONICA-A3",
        name: "Impressão Konica Simplex",
        unit: "CLQ",
        quantityConsumed: 1.0000,
        unitCost: 0.1341,
      },
      {
        id: "x3",
        category: "maquina",
        sku: "MAQ-PLOTTER-SCANN",
        name: "Corte/Vinco Plotter de Mesa",
        unit: "UN",
        quantityConsumed: 1.0000,
        unitCost: 0.30,
      },
    ],
  },

  vazio: {
    salesUnit: "UN",
    yieldPerA3Sheet: 1,
    yieldFactor: 1.0000,
    lossMarginPercent: 0.00,
    taxPercent: 6.00,
    cardTaxPercent: 3.16,
    targetMarginPercent: 50.00,
    quantityTiers: [
      { minQty: 1, discountPercent: 0 },
      { minQty: 10, discountPercent: 5 },
    ],
    components: [],
  },
};

export function calculateProductPricingDetails(
  data: ProductCompositionData
): ProductPricingCalculationResult {
  const components = data.components || [];

  const baseCompositionCost = components.reduce((acc, comp) => {
    if (comp.category === "nenhum") return acc;
    const qty = comp.quantityConsumed || 0;
    const cost = comp.unitCost || 0;
    return acc + qty * cost;
  }, 0);

  const lossPercent = Math.max(0, data.lossMarginPercent || 0);
  const lossMarginAmount = baseCompositionCost * (lossPercent / 100);
  const costWithLoss = baseCompositionCost + lossMarginAmount;

  const tax = Math.max(0, data.taxPercent || 0);
  const cardTax = Math.max(0, data.cardTaxPercent || 0);
  const margin = Math.max(0, data.targetMarginPercent || 0);

  const totalDeductions = margin + tax + cardTax;
  const divisor = 1 - totalDeductions / 100;

  let suggestedPrice = 0;
  if (divisor > 0.05) {
    suggestedPrice = costWithLoss / divisor;
  } else {
    suggestedPrice = costWithLoss * 2.5;
  }

  const minSellPrice = costWithLoss * (1 + margin / 200);

  const taxAmount = suggestedPrice * (tax / 100);
  const cardTaxAmount = suggestedPrice * (cardTax / 100);
  const profitAmount = suggestedPrice - costWithLoss - taxAmount - cardTaxAmount;
  const profitRealPercent = suggestedPrice > 0 ? (profitAmount / suggestedPrice) * 100 : 0;

  const tiers = data.quantityTiers || [
    { minQty: 100, discountPercent: 0 },
    { minQty: 500, discountPercent: 15 },
    { minQty: 1000, discountPercent: 25 },
    { minQty: 5000, discountPercent: 35 },
  ];

  const quantityTierTable = tiers.map((t) => {
    const disc = Math.min(60, Math.max(0, t.discountPercent));
    const unitPrice = suggestedPrice * (1 - disc / 100);
    return {
      qty: t.minQty,
      discountPercent: disc,
      unitPrice: parseFloat(unitPrice.toFixed(2)),
      totalPrice: parseFloat((unitPrice * t.minQty).toFixed(2)),
    };
  });

  return {
    baseCompositionCost,
    lossMarginAmount,
    costWithLoss,

    suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
    minSellPrice: parseFloat(minSellPrice.toFixed(2)),

    profitAmount: parseFloat(profitAmount.toFixed(2)),
    profitRealPercent: parseFloat(profitRealPercent.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    cardTaxAmount: parseFloat(cardTaxAmount.toFixed(2)),

    quantityTierTable,
  };
}
