import { NextResponse } from 'next/server';
import { getDues, insertDue, deleteItem, initDB } from '@/backend/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/backend/lib/auth';

export async function GET(req) {
  const token = req.cookies.get('sfm_token')?.value;
  const user = token ? await verifyAuth(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await initDB();
  const userDues = await getDues(user.id);
  return NextResponse.json(userDues);
}

export async function POST(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await initDB();
    const body = await req.json();
    const { title, amount, dueDate, category } = body;
    
    if (!title || !amount || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newDue = {
      id: uuidv4(),
      userId: user.id,
      title,
      amount: parseFloat(amount),
      dueDate,
      category: category || 'Bill',
      status: 'unpaid'
    };
    
    await insertDue(newDue);
    return NextResponse.json(newDue, { status: 201 });
  } catch (e) {
    console.error('Dues POST Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    await deleteItem('dues', id, user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Dues DELETE Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

