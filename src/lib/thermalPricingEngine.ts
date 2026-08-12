export interface RibbonConsumableItem {
  key: string;
  name: string;
  category: "ribbon" | "printhead";
  ribbonType?: "cera" | "misto" | "resina" | "metalico_rose" | "metalico_dourado_prata";
  lengthMeters: number; // e.g. 76 for 76m roll
  costPrice: number; // e.g. 190.00 for Rosé, 18.00 for Cera
  widthMm?: number; // e.g. 110
}

export interface ThermalConsumablesData {
  selectedRibbonKey: string; // e.g. "ribbon_rose"
  batchRollMeters: number; // e.g. 26 meters
  batchLabelCount: number; // e.g. 1000 labels
  items: Record<string, RibbonConsumableItem>;
}

export interface ThermalCostCalculationResult {
  activeRibbonName: string;
  ribbonLengthMeters: number;
  ribbonCostPrice: number;
  
  // Cost per linear meter of Ribbon
  ribbonCostPerMeter: number;
  
  // Printhead wear cost per meter
  printheadWearCostPerMeter: number;
  
  // Total cost per linear meter
  totalCostPerMeter: number;

  // Batch run calculations
  batchRollMeters: number;
  batchLabelCount: number;
  totalBatchRibbonCost: number;
  costPerLabel: number; // BRL per label without paper

  // Quick batches previews
  cost1000LabelsBatch: number;
  cost5000LabelsBatch: number;
}

// Default consumables for ELGIN L42 Pro FULL
export const DEFAULT_ELGIN_L42_PRO_CONSUMABLES: ThermalConsumablesData = {
  selectedRibbonKey: "ribbon_rose",
  batchRollMeters: 26,
  batchLabelCount: 1000,
  items: {
    ribbon_cera: {
      key: "ribbon_cera",
      name: "Ribbon Cera Preto (110mm x 74m)",
      category: "ribbon",
      ribbonType: "cera",
      lengthMeters: 74,
      costPrice: 18.0,
      widthMm: 110,
    },
    ribbon_misto: {
      key: "ribbon_misto",
      name: "Ribbon Misto Cera/Resina (110mm x 74m)",
      category: "ribbon",
      ribbonType: "misto",
      lengthMeters: 74,
      costPrice: 35.0,
      widthMm: 110,
    },
    ribbon_resina: {
      key: "ribbon_resina",
      name: "Ribbon Resina Padrão (110mm x 74m)",
      category: "ribbon",
      ribbonType: "resina",
      lengthMeters: 74,
      costPrice: 50.0,
      widthMm: 110,
    },
    ribbon_rose: {
      key: "ribbon_rose",
      name: "Ribbon Resina Metálico Rosé (110mm x 76m)",
      category: "ribbon",
      ribbonType: "metalico_rose",
      lengthMeters: 76,
      costPrice: 190.0,
      widthMm: 110,
    },
    ribbon_dourado_prata: {
      key: "ribbon_dourado_prata",
      name: "Ribbon Resina Metálico Dourado / Prata (110mm x 76m)",
      category: "ribbon",
      ribbonType: "metalico_dourado_prata",
      lengthMeters: 76,
      costPrice: 190.0,
      widthMm: 110,
    },
    printhead: {
      key: "printhead",
      name: "Cabeça de Impressão Térmica ELGIN L42 Pro (203dpi)",
      category: "printhead",
      lengthMeters: 50000, // Durability in meters (50km)
      costPrice: 450.0,
    },
  },
};

export function calculateThermalCostDetails(
  data: ThermalConsumablesData
): ThermalCostCalculationResult {
  const items = data.items || DEFAULT_ELGIN_L42_PRO_CONSUMABLES.items;
  const activeKey = data.selectedRibbonKey || "ribbon_rose";
  const activeRibbon = items[activeKey] || items["ribbon_rose"] || {
    name: "Ribbon Resina Metálico Rosé",
    lengthMeters: 76,
    costPrice: 190.0,
  };

  const ribbonLength = Math.max(1, activeRibbon.lengthMeters || 76);
  const ribbonPrice = Math.max(0, activeRibbon.costPrice || 0);

  // 1. Cost per linear meter of active Ribbon
  const ribbonCostPerMeter = ribbonPrice / ribbonLength; // e.g. 190 / 76 = 2.50 R$/m

  // 2. Printhead wear per meter
  const printhead = items["printhead"] || { lengthMeters: 50000, costPrice: 450.0 };
  const printheadWearCostPerMeter =
    printhead.lengthMeters > 0 ? printhead.costPrice / printhead.lengthMeters : 0.009; // e.g. 450 / 50000 = 0.009 R$/m

  const totalCostPerMeter = ribbonCostPerMeter + printheadWearCostPerMeter;

  // 3. Batch calculations
  const batchMeters = Math.max(0.1, data.batchRollMeters || 26);
  const batchLabels = Math.max(1, data.batchLabelCount || 1000);

  // Ribbon used for the batch = batchMeters * ribbonCostPerMeter
  const totalBatchRibbonCost = batchMeters * ribbonCostPerMeter; // e.g. 26m * 2.50 = R$ 65,00

  // Cost per label without paper
  const costPerLabel = totalBatchRibbonCost / batchLabels; // e.g. 65,00 / 1000 = R$ 0,0650

  return {
    activeRibbonName: activeRibbon.name,
    ribbonLengthMeters: ribbonLength,
    ribbonCostPrice: ribbonPrice,

    ribbonCostPerMeter,
    printheadWearCostPerMeter,
    totalCostPerMeter,

    batchRollMeters: batchMeters,
    batchLabelCount: batchLabels,
    totalBatchRibbonCost,
    costPerLabel,

    cost1000LabelsBatch: costPerLabel * 1000,
    cost5000LabelsBatch: costPerLabel * 5000,
  };
}
