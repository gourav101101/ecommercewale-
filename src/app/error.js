'use client';

import Link from 'next/link';
export default function StoreError({ reset }) {
  return <div className="container section" style={{ minHeight: '50vh', textAlign: 'center' }}><h1>Let’s try that again.</h1><p style={{ margin: '20px 0', color: 'var(--color-text-secondary)' }}>We couldn’t load this page. Please refresh or contact our team for help with your order.</p><div style={{ display: 'flex', justifyContent: 'center', gap: 15, flexWrap: 'wrap' }}><button className="btn btn-primary" onClick={reset}>Try again</button><Link href="/contact" className="btn btn-outline">Contact our team</Link></div></div>;
}
