export interface LaserConsumableItem {
  key: string;
  name: string;
  category: "toner" | "cylinder" | "developer" | "fuser" | "belt";
  color: "K" | "M" | "Y" | "C" | "ALL";
  yield5Percent: number; // For toners: yield at 5% coverage; for parts: total page yield
  costPrice: number; // Price in BRL
}

export interface LaserConsumablesData {
  coveragePercent: number; // e.g. 80 (%)
  items: Record<string, LaserConsumableItem>;
}

export interface LaserCostCalculationResult {
  coveragePercent: number;
  coveragePerColorPercent: number;
  tonerCostK: number;
  tonerCostM: number;
  tonerCostY: number;
  tonerCostC: number;
  totalTonersCostA4: number;
  
  cylinderCostK: number;
  cylinderCostM: number;
  cylinderCostY: number;
  cylinderCostC: number;
  totalCylindersCostA4: number;

  developerCostK: number;
  developerCostM: number;
  developerCostY: number;
  developerCostC: number;
  totalDevelopersCostA4: number;

  fuserCostA4: number;
  beltCostA4: number;
  totalPartsCostA4: number;

  // Final totals per A4 page
  costColorA4: number;
  costMonoA4: number;

  // Formats
  costColorA3: number;
  costColorA3Plus: number;
  costMonoA3: number;
  costMonoA3Plus: number;
}

// Default pre-filled parallel/compatible consumables data for Konica Minolta bizhub C284e
export const DEFAULT_KONICA_C284E_CONSUMABLES: LaserConsumablesData = {
  coveragePercent: 80,
  items: {
    toner_k: {
      key: "toner_k",
      name: "Toner Preto TN-321K",
      category: "toner",
      color: "K",
      yield5Percent: 27000,
      costPrice: 135.0,
    },
    toner_m: {
      key: "toner_m",
      name: "Toner Magenta TN-321M",
      category: "toner",
      color: "M",
      yield5Percent: 25000,
      costPrice: 193.0,
    },
    toner_y: {
      key: "toner_y",
      name: "Toner Amarelo TN-321Y",
      category: "toner",
      color: "Y",
      yield5Percent: 25000,
      costPrice: 193.0,
    },
    toner_c: {
      key: "toner_c",
      name: "Toner Ciano TN-321C",
      category: "toner",
      color: "C",
      yield5Percent: 25000,
      costPrice: 193.0,
    },
    cylinder_k: {
      key: "cylinder_k",
      name: "Cilindro DR-311K (Preto)",
      category: "cylinder",
      color: "K",
      yield5Percent: 120000,
      costPrice: 350.0,
    },
    cylinder_m: {
      key: "cylinder_m",
      name: "Cilindro DR-311M (Magenta)",
      category: "cylinder",
      color: "M",
      yield5Percent: 90000,
      costPrice: 350.0,
    },
    cylinder_y: {
      key: "cylinder_y",
      name: "Cilindro DR-311Y (Amarelo)",
      category: "cylinder",
      color: "Y",
      yield5Percent: 90000,
      costPrice: 350.0,
    },
    cylinder_c: {
      key: "cylinder_c",
      name: "Cilindro DR-311C (Ciano)",
      category: "cylinder",
      color: "C",
      yield5Percent: 90000,
      costPrice: 350.0,
    },
    developer_k: {
      key: "developer_k",
      name: "Revelador DV-512K (Preto)",
      category: "developer",
      color: "K",
      yield5Percent: 600000,
      costPrice: 245.0,
    },
    developer_m: {
      key: "developer_m",
      name: "Revelador DV-512M (Magenta)",
      category: "developer",
      color: "M",
      yield5Percent: 600000,
      costPrice: 245.0,
    },
    developer_y: {
      key: "developer_y",
      name: "Revelador DV-512Y (Amarelo)",
      category: "developer",
      color: "Y",
      yield5Percent: 600000,
      costPrice: 245.0,
    },
    developer_c: {
      key: "developer_c",
      name: "Revelador DV-512C (Ciano)",
      category: "developer",
      color: "C",
      yield5Percent: 600000,
      costPrice: 245.0,
    },
    fuser: {
      key: "fuser",
      name: "Unidade / Película de Fusão",
      category: "fuser",
      color: "ALL",
      yield5Percent: 300000,
      costPrice: 760.0,
    },
    belt: {
      key: "belt",
      name: "Belt (Correia de Transferência)",
      category: "belt",
      color: "ALL",
      yield5Percent: 300000,
      costPrice: 815.0,
    },
  },
};

export function calculateLaserCostDetails(data: LaserConsumablesData): LaserCostCalculationResult {
  const coverageTotal = Math.max(1, data.coveragePercent || 80);
  const coveragePerColor = coverageTotal / 4; // e.g. 80 / 4 = 20%

  const items = data.items || DEFAULT_KONICA_C284E_CONSUMABLES.items;

  // 1. Toners calculation
  const calcTonerCost = (itemKey: string) => {
    const item = items[itemKey];
    if (!item || item.yield5Percent <= 0) return 0;
    // Formula: (5 / coveragePerColor) * yield5Percent
    const realYield = (5 / coveragePerColor) * item.yield5Percent;
    return realYield > 0 ? item.costPrice / realYield : 0;
  };

  const tonerCostK = calcTonerCost("toner_k");
  const tonerCostM = calcTonerCost("toner_m");
  const tonerCostY = calcTonerCost("toner_y");
  const tonerCostC = calcTonerCost("toner_c");
  const totalTonersCostA4 = tonerCostK + tonerCostM + tonerCostY + tonerCostC;

  // 2. Parts calculation (Cylinders, Developers, Fuser, Belt)
  const calcPartCost = (itemKey: string) => {
    const item = items[itemKey];
    if (!item || item.yield5Percent <= 0) return 0;
    return item.costPrice / item.yield5Percent;
  };

  const cylinderCostK = calcPartCost("cylinder_k");
  const cylinderCostM = calcPartCost("cylinder_m");
  const cylinderCostY = calcPartCost("cylinder_y");
  const cylinderCostC = calcPartCost("cylinder_c");
  const totalCylindersCostA4 = cylinderCostK + cylinderCostM + cylinderCostY + cylinderCostC;

  const developerCostK = calcPartCost("developer_k");
  const developerCostM = calcPartCost("developer_m");
  const developerCostY = calcPartCost("developer_y");
  const developerCostC = calcPartCost("developer_c");
  const totalDevelopersCostA4 = developerCostK + developerCostM + developerCostY + developerCostC;

  const fuserCostA4 = calcPartCost("fuser");
  const beltCostA4 = calcPartCost("belt");

  const totalPartsCostA4 =
    totalCylindersCostA4 + totalDevelopersCostA4 + fuserCostA4 + beltCostA4;

  // 3. Final A4 totals
  const costColorA4 = totalTonersCostA4 + totalPartsCostA4;
  
  // Mono uses only Black toner + Black Cylinder + Black Developer + Fuser + Belt
  const costMonoA4 =
    tonerCostK + cylinderCostK + developerCostK + fuserCostA4 + beltCostA4;

  return {
    coveragePercent: coverageTotal,
    coveragePerColorPercent: coveragePerColor,
    tonerCostK,
    tonerCostM,
    tonerCostY,
    tonerCostC,
    totalTonersCostA4,

    cylinderCostK,
    cylinderCostM,
    cylinderCostY,
    cylinderCostC,
    totalCylindersCostA4,

    developerCostK,
    developerCostM,
    developerCostY,
    developerCostC,
    totalDevelopersCostA4,

    fuserCostA4,
    beltCostA4,
    totalPartsCostA4,

    costColorA4,
    costMonoA4,

    costColorA3: costColorA4 * 2,
    costColorA3Plus: costColorA4 * 2.25,
    costMonoA3: costMonoA4 * 2,
    costMonoA3Plus: costMonoA4 * 2.25,
  };
}
