// Store-owner assortment decision. Source exports and saved admin records are
// preserved; excluded products must not return after a supplier refresh.
export function excludedFromStorefront(product) {
  if (!product) return false;
  if (/\btape\s+disp[ae]nser\b/i.test(product.name || product.title || '') ||
      /(^|-)tape-disp[ae]nser(-|$)/i.test(product.slug || product.handle || product.id || '') ||
      String(product.id || '') === 'ecosoft-10349740720426') return true;
  return /\bstickers?\b/i.test(product.name || product.title || '') ||
    /(^|-)stickers?(-|$)/i.test(product.slug || product.handle || product.id || '') ||
    (product.slug || product.handle)==='thank-you-review-card' ||
    String(product.id || '')==='ecosoft-10284597772586' ||
    /^thank\s+you\s*\+?\s*review\s+card$/i.test((product.name || product.title || '').trim());
}

// Keep removed saved selections recoverable while excluding them from orders.
export function archiveExcludedSelections(items, kind) {
  const retired=items.filter(excludedFromStorefront);
  if(!retired.length)return;
  try {
    const key=`ecommercewale_retired_sticker_${kind}`;
    const saved=JSON.parse(localStorage.getItem(key) || '[]');
    const previous=Array.isArray(saved)?saved:[];
    const entries=new Map([...previous,...retired].map(item=>[`${item.id}:${item.selectedSize || ''}`,item]));
    localStorage.setItem(key,JSON.stringify([...entries.values()]));
  } catch { /* Restricted storage must not block loading active selections. */ }
}
