import {NextResponse} from 'next/server';
import dbConnect from '@/lib/db';
import {databaseFailureCategory} from '@/lib/catalogue-resilience';
export const dynamic='force-dynamic';
const guidance={
  'not-configured':'Set MONGODB_URI in the Production environment and redeploy.',
  authentication:'Check the MongoDB database-user credentials in the production connection string, then redeploy.',
  dns:'Check the MongoDB hostname, cluster status and DNS access from the hosting environment.',
  'connection-string':'Check the production MongoDB connection-string format and URL-encode password characters.',
  connectivity:'Check Atlas Network Access for the hosting environment, cluster availability and outbound network access.',
  'catalogue-read':'Check hosting function logs and database read permissions.',
};
export async function GET() {
  const headers={'Cache-Control':'private, no-store'};
  try {
    const connection=await dbConnect();
    await connection.connection.db.command({ping:1},{maxTimeMS:3000});
    return NextResponse.json({configured:true,connected:true},{headers});
  } catch(error) {
    const category=databaseFailureCategory(error);
    return NextResponse.json({configured:Boolean(process.env.MONGODB_URI),connected:false,category,nextStep:guidance[category]},{status:503,headers});
  }
}
