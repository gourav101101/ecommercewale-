import './globals.css';
import localFont from 'next/font/local';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper/LayoutWrapper';
import Toast from '@/components/ui/Toast/Toast';

const manrope = localFont({ src: '../../public/fonts/manrope-variable.ttf', variable: '--font-manrope', display: 'swap', weight: '200 800' });

export const metadata = {
  metadataBase: new URL('https://www.ecommercewale.in'),
  title: 'EcommerceWale | Packaging that means business',
  description: 'Discover courier bags, corrugated boxes, tapes, labels and packaging fillers for your business. Compare volume pricing and request your order on WhatsApp.',
  keywords: 'courier bags, packaging, e-commerce, flipkart packaging, amazon packaging, corrugated boxes, thermal labels, shipping supplies India',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'EcommerceWale | Packaging that means business',
    description: 'Wholesale courier bags, boxes, tapes, labels for Flipkart, Amazon, Myntra & Meesho sellers.',
    url: 'https://www.ecommercewale.in',
    siteName: 'EcommerceWale',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/category-boxes.jpg', width: 1024, height: 1024, alt: 'EcommerceWale packaging essentials' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcommerceWale | Packaging that means business',
    description: 'Explore everyday packaging and volume pricing. Build your order list and request your quote on WhatsApp.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
              <WishlistProvider>
                <CartProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <Toast />
                </CartProvider>
              </WishlistProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
