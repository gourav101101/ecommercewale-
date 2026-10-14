import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { databaseSetupResponse } from '@/lib/database-response';
import Contact from '@/models/Contact';

export async function GET() {
  const setup = databaseSetupResponse();
  if (setup) return setup;
  try {
    await dbConnect();
    const inquiries = await Contact.find({}).sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request) {
  const setup = databaseSetupResponse();
  if (setup) return setup;
  try {
    await dbConnect();
    const data = await request.json();
    
    const newContact = await Contact.create(data);
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
