'use client';

import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppWidget.module.css';
import { whatsappUrl } from '@/lib/whatsapp';

export default function WhatsAppWidget() {

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.widget}
      aria-label="Chat on WhatsApp"
    >
      <div className={styles.pulse} />
      <div className={styles.iconWrap}>
        <MessageCircle size={28} />
      </div>
      <span className={styles.tooltip}>Chat with us!</span>
    </a>
  );
}
