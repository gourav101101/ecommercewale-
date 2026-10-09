import ShopClient from './ShopClient';
import { getShopProducts } from '@/lib/products';
import { permanentRedirect } from 'next/navigation';

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

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  if (['labels-stickers', 'boxes-tapes'].includes(params?.category)) {
    const nextParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) value.forEach(item => nextParams.append(key, item));
      else if (value !== undefined) nextParams.set(key, value);
    }
    // The retired combined collection has no single equivalent: show all
    // packaging so bookmarked tape shoppers are not silently sent to boxes.
    if (params.category === 'labels-stickers') nextParams.set('category', 'labels');
    else nextParams.delete('category');
    permanentRedirect(`/shop?${nextParams.toString()}`);
  }
  const products = await getShopProducts();
  return <ShopClient initialProducts={products} />;
}
