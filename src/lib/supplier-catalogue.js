import snapshot from '../../research/ecosoft-full-catalogue.json';
import dbConnect from '@/lib/db';
import SupplierVariantOverride from '@/models/SupplierVariantOverride';
import { buildSupplierProducts } from '@/lib/supplier-products';
import SupplierSnapshot from '@/models/SupplierSnapshot';
import { fetchSupplierSnapshot, snapshotChanges } from '@/lib/supplier-feed';

export async function supplierSnapshot() {
  if (!process.env.MONGODB_URI) return snapshot;
  await dbConnect();
  const saved = await SupplierSnapshot.findOne({ key: 'ecosoft' }).lean();
  return saved?.snapshot || snapshot;
}

export async function refreshSupplierCatalogue() {
  if (!process.env.MONGODB_URI) throw new Error('Connect MongoDB before refreshing the catalogue.');
  const previous = await supplierSnapshot();
  try {
    const next = await fetchSupplierSnapshot();
    // Unexpected mass removal is retained for manual review, never silently applied.
    if (next.productCount < previous.products.length * 0.7) throw new Error('Supplier product count fell by more than 30%. Review the supplier feed before retrying.');
    const changes = snapshotChanges(previous, next);
    await SupplierSnapshot.findOneAndUpdate({ key: 'ecosoft' }, { $set: { snapshot: next, lastChanges: changes, checkedAt: new Date(), lastError: '' } }, { upsert: true, runValidators: true });
    return { fetchedAt: next.fetchedAt, productCount: next.productCount, variantCount: next.variantCount, changes };
  } catch (error) {
    await SupplierSnapshot.updateOne({ key: 'ecosoft' }, { $set: { lastError: error.message, checkedAt: new Date() } });
    throw error;
  }
}

export async function supplierProducts() {
  let overrides=[];
  if (process.env.MONGODB_URI) {
    await dbConnect();
    overrides=await SupplierVariantOverride.find({}).lean();
  }
  return buildSupplierProducts(await supplierSnapshot(),overrides);
}
