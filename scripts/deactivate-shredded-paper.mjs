import mongoose from 'mongoose';
process.loadEnvFile('.env.local');
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 7000 });
  const collection = mongoose.connection.db.collection('categorysettings');
  await collection.updateOne({ categoryId: 'shredded-paper' }, {
    $set: { active: false, updatedAt: new Date() },
    $setOnInsert: { createdAt: new Date() },
  }, { upsert: true });
  const saved = await collection.findOne({ categoryId: 'shredded-paper' });
  if (saved?.active !== false) throw new Error('Verification failed');
  console.log('Verified: Shredded Paper is inactive. Product records preserved.');
} catch {
  console.error('Unable to save category status. Check database connectivity.');
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
