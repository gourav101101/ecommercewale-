import nextEnv from '@next/env';
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';

nextEnv.loadEnvConfig(process.cwd(), true);

try {
  if (!process.env.MONGODB_URI) throw new Error('Database is not configured.');
  const snapshot = JSON.parse(await readFile(new URL('../research/ecosoft-full-catalogue.json', import.meta.url), 'utf8'));
  if (!Array.isArray(snapshot.products) || !snapshot.products.length) throw new Error('Supplier snapshot is empty or invalid.');
  const products = snapshot.products;
  const variantCount = products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
  if (products.some(product => !product.handle || !Array.isArray(product.variants) || !product.variants.length)) throw new Error('Supplier records are incomplete.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const collection = mongoose.connection.db.collection('suppliersnapshots');
  // Insert only: never overwrite a snapshot that was already saved or refreshed.
  const now = new Date();
  const result = await collection.updateOne({ key: 'ecosoft' }, { $setOnInsert: {
    key: 'ecosoft', snapshot, lastError: '', createdAt: now, updatedAt: now,
  } }, { upsert: true });
  const saved = await collection.findOne({ key: 'ecosoft' });
  const savedProducts = saved?.snapshot?.products;
  if (!Array.isArray(savedProducts)) throw new Error('Saved supplier snapshot is invalid.');
  console.log(JSON.stringify({
    database: mongoose.connection.db.databaseName,
    inserted: result.upsertedCount === 1,
    existingSnapshotPreserved: result.upsertedCount === 0,
    savedProductCount: savedProducts.length,
    savedVariantCount: savedProducts.reduce((sum, product) => sum + (product.variants?.length || 0), 0),
    matchesLocalSnapshot: JSON.stringify(saved.snapshot) === JSON.stringify(snapshot),
    localProductCount: products.length,
    localVariantCount: variantCount,
  }));
} catch (error) {
  // Do not print connection strings or database credentials.
  console.error(JSON.stringify({ imported: false, errorType: error.name, errorCode: error.code ?? null }));
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
