import ShopClient from './ShopClient';
import { getShopProducts } from '@/lib/products';

export default async function ShopPage() {
  const products = await getShopProducts();
  return <ShopClient initialProducts={products} />;
}
