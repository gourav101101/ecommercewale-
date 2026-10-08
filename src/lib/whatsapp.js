export const WHATSAPP_PHONE = '919827787080';

export function whatsappUrl(message = 'Hi EcommerceWale! I need help choosing packaging for my business.') {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(amount) || 0);
}

export function orderMessage(items, customer, subtotal) {
  return [
    'Hi EcommerceWale! I would like a quote for this order:', '',
    ...items.map((item, index) => `${index + 1}. ${item.name}\nSize: ${item.sizeLabel || item.selectedSize || 'Standard'} | Quantity: ${item.quantity}\nCatalogue unit price: ${formatMoney(item.pricePerUnit)} | Line estimate: ${formatMoney(item.pricePerUnit * item.quantity)}`),
    '', `Catalogue subtotal: ${formatMoney(subtotal)} (before GST and delivery)`, '',
    `Name: ${customer.name.trim()}`,
    customer.company?.trim() && `Business: ${customer.company.trim()}`,
    `Phone: ${customer.phone.trim()}`,
    `Delivery pincode: ${customer.pincode.trim()}`,
    customer.notes?.trim() && `Notes: ${customer.notes.trim()}`, '',
    'Please confirm stock, final pricing, GST, delivery charges, and payment instructions. This is an order enquiry, not a confirmed purchase.',
  ].filter((line) => typeof line === 'string').join('\n');
}
