import Link from 'next/link';
import { Package } from 'lucide-react';
export default function NotFound() {
  return <div className="container section" style={{ minHeight: '55vh', textAlign: 'center' }}><Package size={45} style={{ margin: '0 auto 20px', color: 'var(--color-primary)' }} /><h1>This pack went off-route.</h1><p style={{ margin: '20px 0', color: 'var(--color-text-secondary)' }}>The page you’re looking for isn’t here. Let’s get you back to the catalogue.</p><Link href="/shop" className="btn btn-primary">Explore packaging</Link></div>;
}
