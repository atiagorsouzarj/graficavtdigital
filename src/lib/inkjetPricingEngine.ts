export interface InkjetConsumableItem {
  key: string;
  name: string;
  category: "ink" | "waste_box";
  color: "K" | "C" | "M" | "Y" | "LC" | "LM" | "ALL";
  yield5Percent: number; // Page yield at 5% coverage (for 70ml bottle e.g. 1500)
  costPrice: number; // Price in BRL (e.g. 85.00 for bottle, 110.00 for waste box)
}

export interface InkjetConsumablesData {
  coveragePercent: number; // e.g. 80 (%)
  items: Record<string, InkjetConsumableItem>;
}

export interface InkjetCostCalculationResult {
  coveragePercent: number;
  coveragePerColorPercent: number; // coverage / 6
  
  // Ink costs per A4 sheet
  inkCostK: number;
  inkCostC: number;
  inkCostM: number;
  inkCostY: number;
  inkCostLC: number;
  inkCostLM: number;
  totalInksCostA4: number;

  // Waste box cost per sheet
  wasteBoxCostA4: number;

  // Final totals for standard papers
  costColorA4: number;
  costMonoA4: number;
  costColorA3: number;
  costColorA3Plus: number;
  costMonoA3: number;
  costMonoA3Plus: number;

  // Photo papers (Forced 100% coverage full-bleed)
  photo10x15Cost: number; // 10x15cm (100% coverage)
  photo20x30Cost: number; // 20x30cm (100% coverage)
  photo30x40Cost: number; // 30x40cm (100% coverage)
}

// Default consumables for Epson EcoTank L18050
export const DEFAULT_EPSON_L18050_CONSUMABLES: InkjetConsumablesData = {
  coveragePercent: 80,
  items: {
    ink_k: {
      key: "ink_k",
      name: "Garrafa Tinta Preta T1081 (70ml)",
      category: "ink",
      color: "K",
      yield5Percent: 1500,
      costPrice: 85.0,
    },
    ink_c: {
      key: "ink_c",
      name: "Garrafa Tinta Ciano T1082 (70ml)",
      category: "ink",
      color: "C",
      yield5Percent: 1500,
      costPrice: 85.0,
    },
    ink_m: {
      key: "ink_m",
      name: "Garrafa Tinta Magenta T1083 (70ml)",
      category: "ink",
      color: "M",
      yield5Percent: 1500,
      costPrice: 85.0,
    },
    ink_y: {
      key: "ink_y",
      name: "Garrafa Tinta Amarela T1084 (70ml)",
      category: "ink",
      color: "Y",
      yield5Percent: 1500,
      costPrice: 85.0,
    },
    ink_lc: {
      key: "ink_lc",
      name: "Garrafa Tinta Ciano Claro T1085 (70ml)",
      category: "ink",
      color: "LC",
      yield5Percent: 1500,
      costPrice: 85.0,
    },
    ink_lm: {
      key: "ink_lm",
      name: "Garrafa Tinta Magenta Claro T1086 (70ml)",
      category: "ink",
      color: "LM",
      yield5Percent: 1500,
      costPrice: 85.0,
    },
    waste_box: {
      key: "waste_box",
      name: "Caixa de Manutenção / Reservatório C9345",
      category: "waste_box",
      color: "ALL",
      yield5Percent: 15000, // Durability in pages
      costPrice: 110.0,
    },
  },
};

export function calculateInkjetCostDetails(data: InkjetConsumablesData): InkjetCostCalculationResult {
  const coverageTotal = Math.max(1, data.coveragePercent || 80);
  const coveragePerColor = coverageTotal / 6; // e.g. 80 / 6 = 13.33%

  const items = data.items || DEFAULT_EPSON_L18050_CONSUMABLES.items;

  // 1. Calculate ink cost per A4 sheet at current coverage
  const calcInkCostA4 = (itemKey: string, customCoverage?: number) => {
    const item = items[itemKey];
    if (!item || item.yield5Percent <= 0) return 0;
    const effCoverage = customCoverage !== undefined ? customCoverage / 6 : coveragePerColor;
    const realYield = (5 / effCoverage) * item.yield5Percent;
    return realYield > 0 ? item.costPrice / realYield : 0;
  };

  const inkCostK = calcInkCostA4("ink_k");
  const inkCostC = calcInkCostA4("ink_c");
  const inkCostM = calcInkCostA4("ink_m");
  const inkCostY = calcInkCostA4("ink_y");
  const inkCostLC = calcInkCostA4("ink_lc");
  const inkCostLM = calcInkCostA4("ink_lm");
  const totalInksCostA4 = inkCostK + inkCostC + inkCostM + inkCostY + inkCostLC + inkCostLM;

  // 2. Waste box cost per page
  const wasteItem = items["waste_box"];
  const wasteBoxCostA4 = wasteItem && wasteItem.yield5Percent > 0 ? wasteItem.costPrice / wasteItem.yield5Percent : 0.0073;

  // 3. Totals for A4
  const costColorA4 = totalInksCostA4 + wasteBoxCostA4;
  const costMonoA4 = inkCostK + wasteBoxCostA4;

  // 4. Formats A3 and A3+
  const costColorA3 = costColorA4 * 2;
  const costColorA3Plus = costColorA4 * 2.25;
  const costMonoA3 = costMonoA4 * 2;
  const costMonoA3Plus = costMonoA4 * 2.25;

  // 5. Photo papers at forced 100% coverage full bleed
  // Full 100% A4 ink cost:
  const inkCostK100 = calcInkCostA4("ink_k", 100);
  const inkCostC100 = calcInkCostA4("ink_c", 100);
  const inkCostM100 = calcInkCostA4("ink_m", 100);
  const inkCostY100 = calcInkCostA4("ink_y", 100);
  const inkCostLC100 = calcInkCostA4("ink_lc", 100);
  const inkCostLM100 = calcInkCostA4("ink_lm", 100);
  const fullA4Color100 = inkCostK100 + inkCostC100 + inkCostM100 + inkCostY100 + inkCostLC100 + inkCostLM100 + wasteBoxCostA4;

  // Area ratio compared to A4 (21 x 29.7 cm = 623.7 cm2)
  // 10x15cm = 150 cm2 -> 150 / 623.7 = 0.2405
  // 20x30cm = 600 cm2 -> 600 / 623.7 = 0.9620
  // 30x40cm = 1200 cm2 -> 1200 / 623.7 = 1.9239
  const photo10x15Cost = fullA4Color100 * (150 / 623.7);
  const photo20x30Cost = fullA4Color100 * (600 / 623.7);
  const photo30x40Cost = fullA4Color100 * (1200 / 623.7);

  return {
    coveragePercent: coverageTotal,
    coveragePerColorPercent: coveragePerColor,

    inkCostK,
    inkCostC,
    inkCostM,
    inkCostY,
    inkCostLC,
    inkCostLM,
    totalInksCostA4,

    wasteBoxCostA4,

    costColorA4,
    costMonoA4,
    costColorA3,
    costColorA3Plus,
    costMonoA3,
    costMonoA3Plus,

    photo10x15Cost,
    photo20x30Cost,
    photo30x40Cost,
  };
}
