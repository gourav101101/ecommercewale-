import { categories } from '@/data/products';
import { categoryStates } from './category-policy';
import dbConnect from '@/lib/db';
import CategorySetting from '@/models/CategorySetting';

export async function getCategorySettings() {
  if (!process.env.MONGODB_URI) return categoryStates(categories);
  await dbConnect();
  return categoryStates(categories, await CategorySetting.find({}).lean());
}

export async function getActiveCategories() {
  try { return (await getCategorySettings()).filter(category => category.active); }
  catch { return []; } // Never republish disabled categories during database failures.
}
