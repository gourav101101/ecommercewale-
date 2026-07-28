import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { getProductDetails } from '@/lib/products';

const siteUrl = 'https://www.ecommercewale.in';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const details = await getProductDetails(slug);

  if (!details) {
    return { title: 'Product Not Found | EcommerceWale', robots: { index: false } };
  }

  const { product } = details;
  const title = `${product.name} | Wholesale Packaging Supplies | EcommerceWale`;
  const description = product.description || `Buy ${product.name} at wholesale prices from EcommerceWale.`;
  const url = `${siteUrl}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, url, type: 'website', images: product.image ? [{ url: product.image, alt: product.name }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: product.image ? [product.image] : [] },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const details = await getProductDetails(slug);
  if (!details) notFound();

  const { product, relatedProducts } = JSON.parse(JSON.stringify(details));
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.gallery?.length ? product.gallery : product.image ? [product.image] : undefined,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'EcommerceWale' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: Number(product.bulkPrice || product.basePrice).toFixed(2),
      availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.reviewCount > 0 && product.rating > 0 ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <ProductClient initialProduct={product} initialRelatedProducts={relatedProducts} />
    </>
  );
}
