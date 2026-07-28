import ShopClient from './ShopClient';
import { getShopProducts } from '@/lib/products';

export const metadata = {
  title: 'Shop Wholesale Packaging Supplies | EcommerceWale',
  description: 'Shop courier bags, corrugated boxes, thermal labels, packing tapes, and shredded paper at wholesale prices for e-commerce sellers across India.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Wholesale Packaging Supplies for Online Sellers | EcommerceWale',
    description: 'Courier bags, boxes, labels, tapes, and more at direct manufacturer prices.',
    url: 'https://www.ecommercewale.in/shop',
  },
};

export default async function ShopPage() {
  const products = await getShopProducts();
  return <ShopClient initialProducts={products} />;
}
