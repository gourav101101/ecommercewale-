'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar/Navbar';
import Footer from '@/components/layout/Footer/Footer';
import WhatsAppWidget from '@/components/layout/WhatsAppWidget/WhatsAppWidget';
import BackToTop from '@/components/ui/BackToTop/BackToTop';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <a href="#main-content" className="skip-link">Skip to content</a>}
      <main id="main-content" style={!isAdmin ? { paddingTop: 'var(--navbar-height)' } : {}}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppWidget />}
      {!isAdmin && <BackToTop />}
    </>
  );
}
