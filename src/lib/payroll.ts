// PRD §4.5 — komisi 70% desainer / 30% kas perusahaan
// Pure function (siap di-test). Pembulatan ke rupiah penuh.
export const COMMISSION_RATE = 0.7 as const;

export interface SplitResult {
  designerShare: number;
  companyShare: number;
}

export function calculateSplit(orderAmount: number): SplitResult {
  if (!Number.isFinite(orderAmount) || orderAmount < 0) {
    throw new Error("orderAmount must be a non-negative finite number");
  }
  // Bulatkan designerShare; companyShare = sisa supaya total selalu = orderAmount
  const designerShare = Math.round(orderAmount * COMMISSION_RATE);
  const companyShare = orderAmount - designerShare;
  return { designerShare, companyShare };
}
