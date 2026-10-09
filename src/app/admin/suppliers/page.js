'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, Download, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './page.module.css';
import VariantEditor from './VariantEditor';

export default function SupplierCatalogue() {
  const [catalogue, setCatalogue] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState('');
  async function refreshCatalogue() {
    setRefreshing(true);
    setRefreshStatus('Checking supplier feed and sitemap…');
    try {
      const response = await fetch('/api/admin/supplier-refresh',{method:'POST'});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Refresh failed. The previous catalogue was kept.');
      const review = await fetch('/api/admin/supplier-catalogue');
      if (!review.ok) throw new Error('Refresh completed, but the review could not reload. Reload this page.');
      setCatalogue(await review.json());
      setRefreshStatus(`Updated: ${result.changes.priceChanges} price changes, ${result.changes.stockChanges} stock changes, ${result.changes.addedVariants} added variants. Store overrides were preserved.`);
    } catch(error) { setRefreshStatus(error.message); }
    finally { setRefreshing(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/supplier-catalogue', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Supplier review could not be loaded. Please sign in again or retry.');
      setCatalogue(await response.json());
    }).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, []);
  if (error) return <div className="adminNotice" role="alert">{error}<button onClick={() => location.reload()}>Retry</button></div>;
  if (!catalogue) return <div className="adminPanel" role="status" style={{ padding: 30 }}>Loading supplier catalogue…</div>;
  const needsReview = product => product.variants.some(variant => Number(variant.price) <= 0 || !variant.available || variant.packConfirmationRequired);
  const products = catalogue.products.filter(product => (!flagged || needsReview(product)) && `${product.title} ${product.variants.map(variant => variant.title).join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className={styles.page}>
    <section className={styles.intro}><div><span>ECOSOFT INDIA · CONNECTED CATALOGUE</span><h2>Every variant. Your price controls.</h2><p>Source records stay available for review. Sticker products, Thank You + Review Card and Tape Dispenser are excluded from the storefront. Source prices are reference estimates unless you set an EcommerceWale price below. Changes are per selected pack/item—not per piece.</p></div><a href="/api/admin/supplier-catalogue?format=csv"><Download size={18} /> Export variants CSV</a></section>
    {!catalogue.editingEnabled&&<div className="adminNotice">MongoDB is unavailable or not configured. The source catalogue is readable, but price and availability changes cannot be saved.</div>}
    <div className={styles.refresh}><button onClick={refreshCatalogue} disabled={refreshing || !catalogue.editingEnabled}>{refreshing?'Checking supplier…':'Refresh supplier prices & stock'}</button><p role="status">{refreshStatus || 'A complete feed and sitemap check runs before publishing. Your store overrides stay unchanged.'}</p></div>
    <div className={styles.stats}><div><strong>{catalogue.products.filter(product=>!product.storefrontExcluded).length}</strong><span>Storefront supplier products</span></div><div><strong>{catalogue.variantCount}</strong><span>Source size / pack variants</span></div><div><strong>{catalogue.sitemapProductCount}</strong><span>Products in supplier sitemap</span></div><div><strong>{catalogue.products.filter(needsReview).length}</strong><span>Stock / price / pack flags</span></div></div>
    <div className={styles.notice}><AlertCircle size={21} /><p>Open a product, then “Costs, stock, GST & delivery” for each variant to enter your commercial details. Mark them confirmed only after checking your records. Supplier availability is not your owned stock. Export the CSV to download saved records. Actual supplier gallery photos are shown below each product; generic AI product renders remain withdrawn.</p></div>
    <div className={styles.toolbar}><label><Search size={19} /><input aria-label="Search supplier catalogue" placeholder="Search products, sizes or pack options" value={query} onChange={event => setQuery(event.target.value)} /></label><label className={styles.check}><input type="checkbox" checked={flagged} onChange={event => setFlagged(event.target.checked)} /> Only stock / price / pack flags</label></div>
    <p className={styles.meta}><CheckCircle size={16} /> {catalogue.feedExhausted && !catalogue.missingFromFeed.length ? 'Feed pagination complete; sitemap reconciled.' : 'Review completeness warnings.'} Snapshot: {new Date(catalogue.fetchedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}. {products.length} products shown.</p>
    <div className={styles.list}>{products.map(product => <article key={product.id} className={styles.card}>
      <div className={styles.row}><div className={styles.image}>{product.images[0] && <Image src={product.images[0].src} alt={`Supplier-reference image of ${product.title}`} fill sizes="90px" />}</div><div className={styles.title}><h3>{product.title}</h3><p>{product.variants.length} variants · {product.imageStatus==='reference-edited'?'Reference-edited presentation':'Actual supplier photo'}</p><a href={product.source} target="_blank" rel="noopener noreferrer">Supplier product page <ExternalLink size={13} /></a></div><button aria-expanded={selected === product.id} aria-controls={`variants-${product.id}`} onClick={() => setSelected(selected === product.id ? null : product.id)}>{selected === product.id ? 'Close details' : 'Review variants'}</button></div>
      {selected === product.id && <div id={`variants-${product.id}`} className={styles.details}>
        <div className={styles.options}>{product.options.map(option => <p key={option.name}><strong>{option.name}:</strong> {option.values.join(' · ')}</p>)}</div>
        {product.storefrontExcluded ? <p role="note">Not sold: excluded from the storefront, search, product pages and active order lists. The original source record is preserved here for reference. Variant overrides cannot re-enable it.</p> : <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">Preview this storefront product <ExternalLink size={14}/></a>}
        <div className={styles.tableWrap}><table><caption>Source prices are preserved. Optional store overrides apply to the exact variant.</caption><thead><tr><th>Variant</th><th>SKU</th><th>Source price</th><th>Source availability</th><th>EcommerceWale settings</th></tr></thead><tbody>{product.variants.map(variant => <tr key={variant.id}><td>{variant.title}{variant.packConfirmationRequired&&<p role="note">Pack count needs confirmation</p>}</td><td>{variant.sku || 'Not supplied'}</td><td>{Number(variant.price) > 0 ? `₹${Number(variant.price).toFixed(2)}` : 'Price confirmation needed'}</td><td>{variant.available ? 'Listed available' : 'Listed unavailable'}</td><td><VariantEditor productId={product.id} variant={variant} enabled={catalogue.editingEnabled}/></td></tr>)}</tbody></table></div>
        <div className={styles.supplierGallery} aria-label={`All supplier photos of ${product.title}`}>{product.images.map((image,index)=><a key={image.id || image.src} href={product.referenceImages[index]?.src || image.src} target="_blank" rel="noopener noreferrer"><div><Image src={image.src} alt={`Supplier photograph ${index+1} of ${product.title}`} fill sizes="180px"/></div><span>Supplier image {index+1} <ExternalLink size={13}/></span></a>)}</div>
      </div>}
    </article>)}</div>
    {!products.length && <div className={styles.empty}><h3>No matches</h3><button onClick={() => { setQuery(''); setFlagged(false); }}>Clear search and filters</button></div>}
  </div>;
}
