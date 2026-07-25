'use client';

import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppWidget.module.css';

export default function WhatsAppWidget() {
  const phoneNumber = '919827787080';
  const message = encodeURIComponent('Hi! I\'m interested in your packaging products. Can you help me?');

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
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
