export function quantityPrice(pricing = [], quantity = 1) {
  const tiers = pricing.filter(tier => Number.isFinite(Number(tier.pricePerUnit)) && Number(tier.pricePerUnit) >= 0).sort((a, b) => Number(b.minQty) - Number(a.minQty));
  return Number((tiers.find(tier => quantity >= Number(tier.minQty)) || tiers.at(-1))?.pricePerUnit || 0);
}

export function validQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 999999;
}
