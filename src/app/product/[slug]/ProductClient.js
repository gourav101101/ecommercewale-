'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatMoney, whatsappUrl } from '@/lib/whatsapp';
import { quantityPrice, validQuantity } from '@/lib/catalogue-pricing';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import SupplierProduct from '@/components/shop/SupplierProduct/SupplierProduct';
import styles from './page.module.css';

export default function ProductClient({ initialProduct, initialRelatedProducts }) {
  if (initialProduct.pricingMode==='variant') return <SupplierProduct product={initialProduct} relatedProducts={initialRelatedProducts}/>;
  return <LegacyProduct initialProduct={initialProduct} initialRelatedProducts={initialRelatedProducts}/>;
}

function LegacyProduct({ initialProduct, initialRelatedProducts }) {
  const [product, setProduct] = useState(initialProduct);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const size = product.sizes?.[sizeIndex];
  const images = [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))];
  const tiers = product.pricing || [];
  const valid = validQuantity(quantity);
  const units = valid ? Number(quantity) : 0;
  const activeTier = [...tiers].sort((a,b) => b.minQty-a.minQty).find(tier => units >= tier.minQty);
  const unitPrice = quantityPrice(tiers, units || 1);
  const unavailable = product.inStock === false || !tiers.length;
  const updateQuantity = value => { setQuantity(value); setAdded(false); };
  const add = () => { if (unavailable || !valid) return; addToCart(product, size?.value || 'standard', units); setAdded(true); showToast('Added to your order list', 'success'); };
  const review = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setReviewPending(true);
    try {
      const response = await fetch(`/api/products/${product.slug}/reviews`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(values) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProduct(previous => ({ ...previous, reviews:data.product.reviews }));
      form.reset(); showToast('Review submitted successfully', 'success');
    } catch { showToast('Could not submit your review. Please try again.', 'error'); }
    finally { setReviewPending(false); }
  };
  return <div className={`container ${styles.page}`}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/shop"><ArrowLeft size={16} /> All packaging</Link><span>/</span><Link href={`/shop?category=${product.category}`}>{product.category==='labels'?'Labels':product.category.replaceAll('-', ' ')}</Link></nav>
    <div className={styles.productLayout}>
      <div className={styles.visualColumn}>
        <div className={styles.mainImage}><Image src={images[imageIndex] || '/images/category-boxes.jpg'} alt={`${product.name} — view ${imageIndex + 1}`} fill sizes="(max-width:850px) 94vw, 55vw" priority />{unavailable && <span className={styles.imageLabel}>Currently unavailable</span>}</div>
        {images.length > 1 && <div className={styles.thumbnails} aria-label="Product images">{images.map((src,index) => <button key={src} onClick={() => setImageIndex(index)} aria-label={`View image ${index+1}`} aria-current={imageIndex===index ? 'true' : undefined}><Image src={src} alt="" fill sizes="80px" /></button>)}</div>}
        <div className={styles.imageFootnote}><span>THE DETAILS MATTER</span><p>{product.image?.startsWith('/images/catalogue/') ? 'AI-created product-family illustration, not an exact SKU photo. Confirm colour, printing, dimensions and pack contents in your quote.' : 'Check your packed dimensions before choosing a size. Need a second opinion? Our team can help.'}</p></div>
      </div>
      <div className={styles.configurator}>
        <span className={styles.eyebrow}>{product.type || 'Everyday essentials'}</span>
        <h1>{product.name}</h1><p className={styles.description}>{product.description}</p>
        <div className={styles.price}><strong>{formatMoney(unitPrice)}</strong><span>per unit at your quantity</span></div>
        <p className={styles.priceNote}>Estimate before GST & delivery. Final quote on WhatsApp.</p>
        <section className={styles.optionSection}>
          <div className={styles.sectionHeading}><h2><span>01</span> Find your fit.</h2><a href="#size-help" onClick={() => { document.getElementById('size-help').open = true; }}>Size advice</a></div>
          <p>{size?.dimensions || 'Choose the option that works for your product.'}</p>
          <div className={styles.sizes}>{(product.sizes || []).map((option,index) => <button key={option.value} aria-pressed={sizeIndex===index} onClick={() => {setSizeIndex(index); setAdded(false);}}><strong>{option.label}</strong>{option.dimensions && <span>{option.dimensions}</span>}{sizeIndex===index && <Check size={16} />}</button>)}</div>
        </section>
        <section className={styles.optionSection}>
          <div className={styles.sectionHeading}><h2><span>02</span> Plan your quantity.</h2></div>
          <p>Choose a price break, or enter your own quantity.</p>
          <div className={styles.tiers}>{tiers.map(tier => <button key={tier.minQty} aria-pressed={activeTier===tier} onClick={() => updateQuantity(tier.minQty)}><span>{tier.label || `${tier.minQty}+ units`}</span><strong>{formatMoney(tier.pricePerUnit)}<small> / unit</small></strong></button>)}</div>
          <div className={styles.quantityRow}><label htmlFor="product-quantity">Your quantity</label><div className={styles.stepper}><button onClick={() => updateQuantity(Math.max(1,Number(quantity)-1))} disabled={Number(quantity)<=1} aria-label="Decrease quantity"><Minus size={17} /></button><input id="product-quantity" aria-label="Order quantity" aria-invalid={!valid} aria-describedby={!valid ? 'quantity-error' : undefined} type="number" min="1" max="999999" step="1" value={quantity} onChange={event => updateQuantity(event.target.value)} /><button onClick={() => updateQuantity(Number(quantity)+1)} disabled={Number(quantity)>=999999} aria-label="Increase quantity"><Plus size={17} /></button></div></div>
          {!valid && <p id="quantity-error" role="alert">Enter a whole quantity between 1 and 999,999.</p>}
        </section>
        <div className={styles.purchasePanel}>
          <div className={styles.total}><div><span>Your selection</span><p>{size?.label || 'Standard'} · {valid ? `${units.toLocaleString('en-IN')} ${units===1 ? 'unit' : 'units'}` : 'Choose a valid quantity'}</p></div><strong aria-live="polite">{valid ? formatMoney(unitPrice*units) : '—'}</strong></div>
          <button className={`btn btn-primary ${styles.addButton}`} onClick={add} disabled={unavailable || !valid}><ShoppingBag size={19} />{unavailable ? 'Currently unavailable' : 'Add to order list'}<ArrowRight size={19} /></button>
          {added && <div className={styles.added} role="status"><Check size={17} /><span>Added to your order list.</span><Link href="/cart">View list <ArrowRight size={15} /></Link></div>}
          <a className={styles.directQuote} href={whatsappUrl(`Hi EcommerceWale! Please help me with ${product.name}, size ${size?.label || 'Standard'}.${valid ? ` Quantity: ${units}. Catalogue estimate: ${formatMoney(unitPrice*units)} before GST and delivery.` : ' I need help choosing a quantity.'}`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />{unavailable ? 'Ask about availability' : 'Ask about this selection'}</a>
          <small>No payment now. We confirm stock, GST and delivery with you.</small>
        </div>
      </div>
    </div>
    <section className={styles.detailsSection} aria-labelledby="details-heading"><div><span className={styles.eyebrow}>KNOW WHAT YOU’RE PACKING WITH</span><h2 id="details-heading">Good packaging.<br />Down to the details.</h2><ul className={styles.features}>{(product.features || []).map(feature => <li key={feature}><Check size={17} />{feature}</li>)}</ul></div><div className={styles.accordions}>
      <details open><summary>Materials & specifications <Plus size={20} /></summary><dl>{Object.entries(product.specs || {}).map(([key,value]) => <div key={key}><dt>{key.replace(/([A-Z])/g,' $1')}</dt><dd>{value}</dd></div>)}</dl></details>
      <details id="size-help"><summary>Choosing the right size <Plus size={20} /></summary><p>Measure your product with any protective wrap already in place. Allow space for closure and cushioning. Listed dimensions describe the catalogue option; confirm usable internal space and pack quantities with our team before ordering.</p><a href={whatsappUrl(`Hi! Please help me choose a size for ${product.name}.`)} target="_blank" rel="noopener noreferrer">Get personal size advice <ArrowRight size={16} /></a></details>
      <details><summary>Ordering, delivery & payment <Plus size={20} /></summary><p>Add your chosen sizes and quantities to your order list. Share the list on WhatsApp, where our team confirms availability, pricing, GST and delivery. Your enquiry is not a confirmed purchase and no online payment is collected.</p><Link href="/faq">Visit the help centre <ArrowRight size={16} /></Link></details>
    </div></section>
    <section className={styles.reviews}><div><span className={styles.eyebrow}>FROM THE PEOPLE WHO PACK</span><h2>Customer feedback.</h2><p>{product.reviews?.length ? `${product.reviews.length} customer reviews` : 'No reviews yet. Have you used this product? Share your experience.'}</p></div><div><details className={styles.reviewForm}><summary>Write a review <Plus size={18} /></summary><form onSubmit={review}><label htmlFor="review-name">Your name</label><input className="input" id="review-name" name="userName" autoComplete="name" required maxLength={100} /><label htmlFor="review-rating">Rating</label><select className="input" id="review-rating" name="rating" defaultValue="5">{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} stars</option>)}</select><label htmlFor="review-comment">Your experience</label><textarea className="input" id="review-comment" name="comment" rows={4} required maxLength={2000} /><button className="btn btn-primary" disabled={reviewPending}>{reviewPending ? 'Submitting…' : 'Submit review'}</button></form></details>{(product.reviews || []).slice().reverse().map((item,index) => <article className={styles.review} key={item._id || index}><header><strong>{item.userName}</strong><span>{item.rating} / 5</span></header><p>{item.comment}</p></article>)}</div></section>
    {initialRelatedProducts.length > 0 && <section className={styles.related}><div className={styles.relatedHeading}><h2>Finish your packing list.</h2><Link href="/shop">Explore everything <ArrowRight size={17} /></Link></div><div className={styles.relatedGrid}>{initialRelatedProducts.map(item => <ProductCard key={item.id} product={item} />)}</div></section>}
  </div>;
}
