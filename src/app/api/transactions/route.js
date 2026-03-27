import { NextResponse } from 'next/server';
import { getTransactions, insertTransaction, initDB } from '@/backend/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/backend/lib/auth';

export async function GET(req) {
  const token = req.cookies.get('sfm_token')?.value;
  const user = token ? await verifyAuth(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await initDB();
  const data = await getTransactions(user.id);
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await initDB();
    const body = await req.json();
    const { type, amount, description, category } = body;
    
    if (!type || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTransaction = {
      id: uuidv4(),
      userId: user.id,
      type,
      amount: parseFloat(amount),
      description,
      category: category || 'General',
      date: new Date().toISOString()
    };
    
    await insertTransaction(newTransaction);
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (e) {
    console.error('TX Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

