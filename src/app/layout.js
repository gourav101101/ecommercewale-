import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper/LayoutWrapper';
import Toast from '@/components/ui/Toast/Toast';

export const metadata = {
  metadataBase: new URL('https://www.ecommercewale.in'),
  title: 'EcommerceWale.in — India\'s #1 E-Commerce Packaging Store',
  description: 'Buy courier bags, corrugated boxes, packaging tapes, thermal labels & shredded paper at wholesale prices. Trusted by 10,000+ Flipkart, Amazon, Myntra & Meesho sellers.',
  keywords: 'courier bags, packaging, e-commerce, flipkart packaging, amazon packaging, corrugated boxes, thermal labels, shipping supplies India',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'EcommerceWale.in — Packaging Supplies for E-Commerce Sellers',
    description: 'Wholesale courier bags, boxes, tapes, labels for Flipkart, Amazon, Myntra & Meesho sellers.',
    url: 'https://ecommercewale.in',
    siteName: 'EcommerceWale',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcommerceWale.in - Packaging Supplies for E-Commerce Sellers',
    description: 'Wholesale courier bags, boxes, tapes, and labels for online sellers across India.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AdminAuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <Toast />
                </CartProvider>
              </WishlistProvider>
            </AdminAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
