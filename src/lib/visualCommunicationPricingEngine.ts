export interface BannerCalculationInput {
  widthMeters: number; // e.g., 1.20m
  heightMeters: number; // e.g., 0.90m
  supplierPricePerM2: number; // e.g., R$ 35.00 / m2
  minChargeUnder1M2: number; // e.g., R$ 26.00 fixed minimum if area < 1.0 m2
  freightCost: number; // e.g., R$ 10.00
  targetMarginPercent: number; // e.g., 40.00%
  taxPercent: number; // e.g., 6.00%
  cardTaxPercent: number; // e.g., 3.16%
}

export interface BannerCalculationResult {
  areaM2: number; // width * height
  isUnder1M2: boolean;
  supplierBaseCost: number; // area * price OR minCharge
  totalCostWithFreight: number;
  suggestedPrice: number;
  profitAmount: number;
  profitRealPercent: number;
}

export interface StickerM2Input {
  stickerWidthCm: number; // e.g., 6cm
  stickerHeightCm: number; // e.g., 6cm
  gapMm: number; // e.g., 3mm plotter gap
  supplierPricePerM2: number; // e.g., R$ 40.00 / m2
  quantityOrdered: number; // e.g., 100 stickers
  freightCost: number;
  targetMarginPercent: number;
  taxPercent: number;
  cardTaxPercent: number;
}

export interface StickerM2Result {
  stickersPerRow: number;
  rowsPerM2: number;
  yieldPerM2: number; // How many stickers fit in 1m2
  costPerStickerBase: number; // R$ 40.00 / yieldPerM2
  totalM2Needed: number; // quantityOrdered / yieldPerM2
  totalSupplierCost: number; // totalM2Needed * supplierPricePerM2
  totalCostWithFreight: number;
  suggestedPricePerSticker: number;
  totalBatchPrice: number;
  profitAmount: number;
}

/**
 * Calculates Banner Pricing with the < 1m² minimum charge rule.
 */
export function calculateBannerPricing(
  input: BannerCalculationInput
): BannerCalculationResult {
  const width = Math.max(0.01, input.widthMeters || 1.2);
  const height = Math.max(0.01, input.heightMeters || 0.9);
  const areaM2 = width * height;

  const isUnder1M2 = areaM2 < 1.0;
  const supplierPrice = input.supplierPricePerM2 || 35.0;
  const minCharge = input.minChargeUnder1M2 || 26.0;

  // Rule: If area < 1m2, force minimum charge (R$ 26.00). Else area * supplierPrice
  const supplierBaseCost = isUnder1M2 ? minCharge : areaM2 * supplierPrice;
  const freight = Math.max(0, input.freightCost || 0);
  const totalCostWithFreight = supplierBaseCost + freight;

  const margin = Math.max(0, input.targetMarginPercent || 40);
  const tax = Math.max(0, input.taxPercent || 0);
  const cardTax = Math.max(0, input.cardTaxPercent || 0);

  const deductions = margin + tax + cardTax;
  const divisor = 1 - deductions / 100;

  const suggestedPrice =
    divisor > 0.05
      ? totalCostWithFreight / divisor
      : totalCostWithFreight * 2;

  const profitAmount =
    suggestedPrice - totalCostWithFreight - suggestedPrice * ((tax + cardTax) / 100);
  const profitRealPercent =
    suggestedPrice > 0 ? (profitAmount / suggestedPrice) * 100 : 0;

  return {
    areaM2: parseFloat(areaM2.toFixed(4)),
    isUnder1M2,
    supplierBaseCost: parseFloat(supplierBaseCost.toFixed(2)),
    totalCostWithFreight: parseFloat(totalCostWithFreight.toFixed(2)),
    suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
    profitAmount: parseFloat(profitAmount.toFixed(2)),
    profitRealPercent: parseFloat(profitRealPercent.toFixed(2)),
  };
}

/**
 * Calculates Sticker Yield & Pricing per m² (R$ 40.00 / m²).
 */
export function calculateStickerM2Pricing(
  input: StickerM2Input
): StickerM2Result {
  const wCm = Math.max(0.5, input.stickerWidthCm || 6);
  const hCm = Math.max(0.5, input.stickerHeightCm || 6);
  const gapCm = (input.gapMm || 3) / 10; // e.g. 0.3cm

  // Roll printable width e.g., 100cm x 100cm (1m2)
  const stickersPerRow = Math.floor(100 / (wCm + gapCm)) || 1;
  const rowsPerM2 = Math.floor(100 / (hCm + gapCm)) || 1;
  const yieldPerM2 = stickersPerRow * rowsPerM2;

  const supplierPriceM2 = input.supplierPricePerM2 || 40.0;
  const costPerStickerBase = yieldPerM2 > 0 ? supplierPriceM2 / yieldPerM2 : 0.2;

  const qty = Math.max(1, input.quantityOrdered || 100);
  const totalM2Needed = qty / yieldPerM2;
  const totalSupplierCost = totalM2Needed * supplierPriceM2;
  const freight = Math.max(0, input.freightCost || 0);
  const totalCostWithFreight = totalSupplierCost + freight;

  const margin = Math.max(0, input.targetMarginPercent || 50);
  const tax = Math.max(0, input.taxPercent || 0);
  const cardTax = Math.max(0, input.cardTaxPercent || 0);

  const deductions = margin + tax + cardTax;
  const divisor = 1 - deductions / 100;

  const totalBatchPrice =
    divisor > 0.05
      ? totalCostWithFreight / divisor
      : totalCostWithFreight * 2;

  const suggestedPricePerSticker = totalBatchPrice / qty;
  const profitAmount =
    totalBatchPrice - totalCostWithFreight - totalBatchPrice * ((tax + cardTax) / 100);

  return {
    stickersPerRow,
    rowsPerM2,
    yieldPerM2,
    costPerStickerBase: parseFloat(costPerStickerBase.toFixed(4)),
    totalM2Needed: parseFloat(totalM2Needed.toFixed(4)),
    totalSupplierCost: parseFloat(totalSupplierCost.toFixed(2)),
    totalCostWithFreight: parseFloat(totalCostWithFreight.toFixed(2)),
    suggestedPricePerSticker: parseFloat(suggestedPricePerSticker.toFixed(2)),
    totalBatchPrice: parseFloat(totalBatchPrice.toFixed(2)),
    profitAmount: parseFloat(profitAmount.toFixed(2)),
  };
}
