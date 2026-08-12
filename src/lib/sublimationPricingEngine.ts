export interface SublimationConsumableItem {
  key: string;
  name: string;
  category: "ink" | "felt_pad";
  color: "K" | "C" | "M" | "Y" | "ALL";
  yield5Percent: number; // Yield at 5% coverage (100ml bottle e.g. 2000)
  costPrice: number; // Price in BRL (e.g. 33.50 for Gênesis 100ml bottle)
}

export interface SublimationConsumablesData {
  coveragePercent: number; // Always 100 (%) for sublimation
  items: Record<string, SublimationConsumableItem>;
}

export interface SublimationCostCalculationResult {
  coveragePercent: number; // 100
  coveragePerColorPercent: number; // 25% per color (100 / 4)

  // Ink costs per A4 sheet at 100% full bleed
  inkCostK: number;
  inkCostC: number;
  inkCostM: number;
  inkCostY: number;
  totalInksCostA4: number;

  // Waste felt pad cost per page
  feltPadCostA4: number;

  // Final totals for Sublimation Transfer
  costColorA4: number; // A4 Sublimático
  costMonoA4: number; // P&B Sublimático
  costColorA3: number; // A3 Sublimático
  costMonoA3: number; // P&B A3 Sublimático
}

// Default consumables for Epson EcoTank L3150 Sublimática (Gênesis 100ml Inks)
export const DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES: SublimationConsumablesData = {
  coveragePercent: 100, // Locked @ 100%
  items: {
    ink_k: {
      key: "ink_k",
      name: "Tinta Sublimática Gênesis Preta Sublidesk (100ml)",
      category: "ink",
      color: "K",
      yield5Percent: 2000,
      costPrice: 33.5,
    },
    ink_c: {
      key: "ink_c",
      name: "Tinta Sublimática Gênesis Ciano Sublidesk (100ml)",
      category: "ink",
      color: "C",
      yield5Percent: 2000,
      costPrice: 33.5,
    },
    ink_m: {
      key: "ink_m",
      name: "Tinta Sublimática Gênesis Magenta Sublidesk (100ml)",
      category: "ink",
      color: "M",
      yield5Percent: 2000,
      costPrice: 33.5,
    },
    ink_y: {
      key: "ink_y",
      name: "Tinta Sublimática Gênesis Amarela Sublidesk (100ml)",
      category: "ink",
      color: "Y",
      yield5Percent: 2000,
      costPrice: 33.5,
    },
    felt_pad: {
      key: "felt_pad",
      name: "Almofadas de Resíduo / Feltro de Limpeza L3150",
      category: "felt_pad",
      color: "ALL",
      yield5Percent: 10000, // Pages durability
      costPrice: 45.0,
    },
  },
};

export function calculateSublimationCostDetails(
  data: SublimationConsumablesData
): SublimationCostCalculationResult {
  const coverageTotal = 100; // Always 100% full bleed for sublimation
  const coveragePerColor = 25; // 100 / 4 = 25%

  const items = data.items || DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES.items;

  // Calculate ink cost per A4 sheet at 100% coverage
  const calcInkCostA4 = (itemKey: string) => {
    const item = items[itemKey];
    if (!item || item.yield5Percent <= 0) return 0;
    const realYield = (5 / coveragePerColor) * item.yield5Percent; // (5 / 25) * yield5Percent
    return realYield > 0 ? item.costPrice / realYield : 0;
  };

  const inkCostK = calcInkCostA4("ink_k");
  const inkCostC = calcInkCostA4("ink_c");
  const inkCostM = calcInkCostA4("ink_m");
  const inkCostY = calcInkCostA4("ink_y");
  const totalInksCostA4 = inkCostK + inkCostC + inkCostM + inkCostY;

  // Waste felt pad cost per page
  const feltItem = items["felt_pad"];
  const feltPadCostA4 =
    feltItem && feltItem.yield5Percent > 0 ? feltItem.costPrice / feltItem.yield5Percent : 0.0045;

  // A4 Sublimático
  const costColorA4 = totalInksCostA4 + feltPadCostA4;
  const costMonoA4 = inkCostK + feltPadCostA4;

  // A3 Sublimático (2x A4)
  const costColorA3 = costColorA4 * 2;
  const costMonoA3 = costMonoA4 * 2;

  return {
    coveragePercent: 100,
    coveragePerColorPercent: 25,

    inkCostK,
    inkCostC,
    inkCostM,
    inkCostY,
    totalInksCostA4,

    feltPadCostA4,

    costColorA4,
    costMonoA4,
    costColorA3,
    costMonoA3,
  };
}
