import mongoose from 'mongoose';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Narrow, repeatable migration. Default is read-only; never clear collections.
export function matchesDemo(record, sample) {
  return Object.entries(sample).every(([key, value]) => record[key] === value);
}

async function main() {
  process.loadEnvFile('.env.local');
  if (!process.env.MONGODB_URI) throw new Error('Database configuration missing');
  const manifest = JSON.parse(await readFile(new URL('./demo-data-manifest.json', import.meta.url), 'utf8'));
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 7000 });
  try {
    const selected = {};
    const report = {};
    for (const [collection, samples] of Object.entries(manifest)) {
      const records = await mongoose.connection.db.collection(collection).find({ id: { $in: samples.map(item => item.id) } }).toArray();
      selected[collection] = records.filter(record => samples.some(sample => matchesDemo(record, sample)));
      report[collection] = { matchedDemo: selected[collection].length, preservedChangedRecords: records.length - selected[collection].length };
    }
    console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'preview', collections: report }));
    if (!process.argv.includes('--apply')) return;
    const backupDirectory = resolve('.tmp/demo-cleanup');
    await mkdir(backupDirectory, { recursive: true });
    const backupPath = resolve(backupDirectory, `${Date.now()}.json`);
    await writeFile(backupPath, mongoose.mongo.BSON.EJSON.stringify(selected), { flag: 'wx' });
    console.log('Backup saved in .tmp/demo-cleanup (excluded from Git).');
    for (const [collection, records] of Object.entries(selected)) {
      let deleted = 0;
      for (const record of records) {
        const sample = manifest[collection].find(item => matchesDemo(record, item));
        // Recheck fingerprint and update timestamp to preserve concurrent edits.
        const result = await mongoose.connection.db.collection(collection).deleteOne({
          _id: record._id, ...sample,
          updatedAt: record.updatedAt ?? { $exists: false },
        });
        deleted += result.deletedCount;
      }
      console.log(JSON.stringify({ collection, deleted }));
    }
  } finally { await mongoose.disconnect(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(JSON.stringify({ error: 'Demo cleanup could not complete', type: error.name, code: error.code, causeCode: error.cause?.code })); process.exitCode = 1; });
}
