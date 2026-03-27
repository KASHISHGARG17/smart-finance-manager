import { NextResponse } from 'next/server';
import { insertTransaction, initDB } from '@/backend/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/backend/lib/auth';

export async function POST(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await initDB();
    const body = await req.json();
    const { amount, description, type, category, method, isSandbox } = body;
    
    if (!isSandbox) return NextResponse.json({ error: 'Only sandbox mode is allowed' }, { status: 403 });
    
    await new Promise((resolve) => setTimeout(resolve, 800)); // Latency sim
    
    if (!amount || amount <= 0) return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });

    const newTransaction = {
      id: uuidv4(),
      userId: user.id,
      type: type || 'expense',
      amount: parseFloat(amount),
      description: description || 'Simulation Engine',
      category: category || 'General',
      date: new Date().toISOString()
    };
    
    await insertTransaction(newTransaction);
    
    return NextResponse.json({ success: true, transactionId: newTransaction.id });
  } catch (e) {
    console.error('Simulate Error:', e);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

