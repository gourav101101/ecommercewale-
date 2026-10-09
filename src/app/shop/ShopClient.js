'use client';

import { useState, useMemo, Suspense, useDeferredValue, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, SlidersHorizontal, X, Package, ArrowRight } from 'lucide-react';
import { categories } from '@/data/products';
import { marketplaces } from '@/data/marketplace';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import { whatsappUrl } from '@/lib/whatsapp';
import styles from './page.module.css';

function Catalogue({ products, params }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get('search') || '');
  const deferredQuery = useDeferredValue(query);
  const category = categories.some(item => item.id === params.get('category')) ? params.get('category') : 'all';
  const marketplace = marketplaces.some(item => item.id === params.get('marketplace')) ? params.get('marketplace') : 'all';
  const sort = ['price-low', 'price-high', 'name'].includes(params.get('sort')) ? params.get('sort') : 'featured';
  const inStock = params.get('stock') === '1';
  const finish=category==='courier-bags' && ['paper','opaque','transparent'].includes(params.get('finish')) ? params.get('finish') : 'all';
  const pocket=category==='courier-bags' && ['with','without'].includes(params.get('pocket')) ? params.get('pocket') : 'all';
  const [filtersOpen, setFiltersOpen] = useState(false);

  function update(values) {
    const next = new URLSearchParams(params.toString());
    if (query.trim()) next.set('search', query.trim()); else next.delete('search');
    Object.entries(values).forEach(([key, value]) => { if (!value || value === 'all' || value === 'featured') next.delete(key); else next.set(key, value); });
    if(values.category && values.category!=='courier-bags') { next.delete('finish'); next.delete('pocket'); }
    startTransition(() => router.replace(`/shop${next.size ? '?' + next.toString() : ''}`, { scroll: false }));
  }
  const clear = () => { setQuery(''); startTransition(() => router.replace('/shop', { scroll: false })); };
  const filtered = useMemo(() => products.filter(product => {
    const text = `${product.name} ${product.description || ''} ${product.type || ''} ${product.searchOptions || ''}`.toLowerCase();
    return deferredQuery.toLowerCase().trim().split(/\s+/).every(word => text.includes(word)) && (category === 'all' || product.category === category) && (marketplace === 'all' || product.marketplaceCompatible?.includes(marketplace)) && (!inStock || (product.inStock !== false && !product.packConfirmationRequired)) && (finish==='all' || product.courierDetails?.finish===finish) && (pocket==='all' || product.courierDetails?.pocket===pocket);
  }).sort((a, b) => {
    const stock = Number(a.inStock === false) - Number(b.inStock === false);
    if (stock) return stock;
    const priceA = Number(a.pricing?.[0]?.pricePerUnit ?? a.basePrice) || 0;
    const priceB = Number(b.pricing?.[0]?.pricePerUnit ?? b.basePrice) || 0;
    if (sort === 'price-low') return priceA - priceB;
    if (sort === 'price-high') return priceB - priceA;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return Number(!!b.bestSeller) - Number(!!a.bestSeller);
  }), [products, deferredQuery, category, marketplace, inStock, sort, finish, pocket]);
  const active = query || category !== 'all' || marketplace !== 'all' || inStock || finish!=='all' || pocket!=='all';
  const collection = categories.find(item => item.id === category);
  return <div className={styles.page}>
    <header className={`container ${styles.intro}`}><div><p>THE PACKAGING COLLECTION</p><h1>{collection?.name || 'Small details.\nBetter deliveries.'}</h1></div><div className={styles.introAside}><span>{collection?.description || 'Find the right bag, box or finishing touch. Choose your size, build your order, and leave the details to a real conversation.'}</span><a href="#collection">Explore {collection?.name || 'all packaging'} <ArrowRight size={18} /></a></div></header>
    <div className={`container ${styles.catalogue}`}>
      <div className={styles.collectionLayout} id="collection">
      <aside className={styles.collectionRail}><span className={styles.railLabel}>SHOP BY CATEGORY</span>
      <nav className={styles.categories} aria-label="Product categories">
        {[{ id: 'all', name: 'All packaging', image: '/images/packaging-campaign.webp' }, ...categories].map(item => <button key={item.id} type="button" onClick={() => update({ category: item.id })} aria-pressed={category === item.id}><span className={styles.categoryImage}><Image src={item.image} alt="" fill sizes="64px" /></span><span>{item.name}</span><small>{products.filter(product => item.id === 'all' || product.category === item.id).length}</small></button>)}
      </nav>
      </aside>
      <div className={styles.collectionResults}>
      <div className={styles.toolbar}>
        <button className={styles.filterButton} type="button" aria-expanded={filtersOpen} aria-controls="catalogue-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} /> Filters{(marketplace !== 'all' || inStock || finish!=='all' || pocket!=='all') && <span className={styles.dot} />}</button>
        <form className={styles.search} role="search" onSubmit={event => { event.preventDefault(); update({ search: query.trim() }); }}><Search size={18} /><input type="search" aria-label="Search packaging catalogue" placeholder="Search the collection" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); update({ search: '' }); }}><X size={17} /></button>}</form>
        <label className={styles.sort}><span>Sort by</span><select aria-label="Sort products" value={sort} onChange={event => update({ sort: event.target.value })}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
      </div>
      {filtersOpen && <section id="catalogue-filters" aria-label="Catalogue filters" className={styles.filters}><label>Marketplace fit<select value={marketplace} onChange={event => update({ marketplace: event.target.value })}><option value="all">All marketplaces</option>{marketplaces.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>{category==='courier-bags'&&<><label>Mailer type<select aria-label="Filter courier mailer type" value={finish} onChange={event=>update({finish:event.target.value})}><option value="all">All mailer types</option><option value="paper">Paper</option><option value="opaque">Opaque</option><option value="transparent">Transparent</option></select></label><label>Document pocket<select aria-label="Filter document pocket" value={pocket} onChange={event=>update({pocket:event.target.value})}><option value="all">All pocket options</option><option value="with">With pocket</option><option value="without">Without pocket</option></select></label></>}<label className={styles.checkbox}><input type="checkbox" checked={inStock} onChange={event => update({ stock: event.target.checked ? '1' : '' })} /> Available products only</label><button onClick={clear}>Reset all filters <X size={16} /></button></section>}
      <div className={styles.resultHeading}><span aria-live="polite">{pending ? 'Updating collection…' : `${filtered.length} products`}</span><span>Pack/item prices</span></div>
      {active && <div className={styles.applied} aria-label="Active filters">
        {collection && <button onClick={() => update({ category: 'all' })}>{collection.name}<X size={14} /></button>}
        {query && <button onClick={() => { setQuery(''); update({ search: '' }); }}>Search: {query}<X size={14} /></button>}
        {marketplace !== 'all' && <button onClick={() => update({ marketplace: 'all' })}>{marketplaces.find(item => item.id === marketplace)?.name}<X size={14} /></button>}
        {finish!=='all'&&<button onClick={()=>update({finish:'all'})}>{finish} mailer<X size={14}/></button>}
        {pocket!=='all'&&<button onClick={()=>update({pocket:'all'})}>{pocket==='with'?'With document pocket':'Without document pocket'}<X size={14}/></button>}
        {inStock && <button onClick={() => update({ stock: '' })}>Available only<X size={14} /></button>}
        <button className={styles.clear} onClick={clear}>Clear all</button>
      </div>}
      <section aria-label="Product results" aria-busy={pending}>
        {filtered.length ? <div className={styles.grid}>{filtered.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}</div> : <div className={styles.empty}><Package size={38} /><h2>Let’s find a better fit.</h2><p>No products match these filters. Try another search or explore the whole collection.</p><button onClick={clear}>Show all packaging <ArrowRight size={18} /></button></div>}
      </section>
      </div></div>
      <aside className={styles.help}><div><span>A LITTLE HELP GOES A LONG WAY</span><h2>Not sure what fits?</h2><p>Tell us what you’re shipping. We’ll help with the right size and quantity.</p></div><a href={whatsappUrl('Hi! Please help me choose packaging for my products.')} target="_blank" rel="noopener noreferrer">Talk packaging with us <ArrowRight size={19} /></a></aside>
    </div>
  </div>;
}
function ShopFromUrl({ initialProducts }) {
  const params = useSearchParams();
  return <Catalogue key={params.get('search') || ''} products={initialProducts} params={params} />;
}
export default function ShopClient({ initialProducts }) {
  return <Suspense fallback={<Catalogue products={initialProducts} params={new URLSearchParams()} />}><ShopFromUrl initialProducts={initialProducts} /></Suspense>;
}
