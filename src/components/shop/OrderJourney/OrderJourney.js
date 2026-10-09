import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import styles from './OrderJourney.module.css';

export default function OrderJourney({ step = 1 }) {
  return <nav className={styles.journey} aria-label="Order enquiry progress">
    {[['Your selection', '/cart'], ['Your details', '/checkout'], ['WhatsApp quote', null]].map(([label, href], index) => <div key={label} className={styles.step} aria-current={step === index + 1 ? 'step' : undefined}>
      <span className={styles.number}>{step > index + 1 ? <Check size={15} /> : `0${index + 1}`}</span>
      {href && step > index + 1 ? <Link href={href}>{label}</Link> : <span>{label}</span>}
      {index < 2 && <ArrowRight size={16} className={styles.arrow} />}
    </div>)}
  </nav>;
}
