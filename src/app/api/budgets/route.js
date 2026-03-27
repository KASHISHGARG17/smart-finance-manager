import { NextResponse } from 'next/server';
import { getBudgets, insertBudget, deleteItem, initDB } from '@/backend/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/backend/lib/auth';

export async function GET(req) {
  const token = req.cookies.get('sfm_token')?.value;
  const user = token ? await verifyAuth(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await initDB();
  const userBudgets = await getBudgets(user.id);
  return NextResponse.json(userBudgets);
}

export async function POST(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await initDB();
    const body = await req.json();
    const { category, limit } = body;
    
    if (!category || !limit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Note: In a real app, we would use an UPSERT here. 
    // For this migration, we'll keep it simple: delete existing for this category, then insert new.
    const allBudgets = await getBudgets(user.id);
    const existing = allBudgets.find(b => b.category === category);
    if (existing) {
      await deleteItem('budgets', existing.id, user.id);
    }

    const budgetData = {
      id: uuidv4(),
      userId: user.id,
      category,
      limitAmount: parseFloat(limit),
    };

    await insertBudget(budgetData);
    
    return NextResponse.json(budgetData, { status: 201 });
  } catch (e) {
    console.error('Budgets POST Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    await deleteItem('budgets', id, user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Budgets DELETE Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

