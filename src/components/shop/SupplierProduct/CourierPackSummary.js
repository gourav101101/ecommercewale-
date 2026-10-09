import { formatMoney, whatsappUrl } from '@/lib/whatsapp';
import styles from './CourierPackSummary.module.css';

export default function CourierPackSummary({product,variant,quantity=1}) {
  if(product.category!=='courier-bags') return null;
  const count=variant.packQuantity;
  const wholeQuantity=Number.isInteger(Number(quantity)) && Number(quantity)>0 && Number(quantity)<=999999;
  if(variant.packConfirmationRequired) return <div className={styles.warning} role="status">
    <span>Pack quantity needs confirmation.</span>
    <a href={whatsappUrl(`Hi! Please confirm the bags per pack for ${product.name}. Option: ${variant.title}. Variant ID: ${variant.id}.`)} target="_blank" rel="noopener noreferrer">Ask us</a>
  </div>;
  return <div className={styles.summary} aria-label="Selected bag quantity" aria-live="polite">
    <span data-testid="total-bags">{wholeQuantity?`${(count*Number(quantity)).toLocaleString('en-IN')} bags total`:'Enter pack quantity'}</span>
    {variant.price>0&&<span>≈ {formatMoney(variant.price/count)} / bag</span>}
  </div>;
}
