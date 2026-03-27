import { NextResponse } from 'next/server';
import { getCards, insertCard, deleteItem, initDB } from '@/backend/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/backend/lib/auth';

export async function GET(req) {
  const token = req.cookies.get('sfm_token')?.value;
  const user = token ? await verifyAuth(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await initDB();
  const userCards = await getCards(user.id);
  return NextResponse.json(userCards);
}

export async function POST(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await initDB();
    const body = await req.json();
    const { bankName, cardHolder, lastFour, type } = body;
    
    if (!bankName || !lastFour || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCard = {
      id: uuidv4(),
      userId: user.id,
      bankName,
      cardHolder: cardHolder || user.name,
      lastFour,
      type, // 'Debit', 'Credit', 'UPI', 'Bank Account'
    };
    
    await insertCard(newCard);
    return NextResponse.json(newCard, { status: 201 });
  } catch (e) {
    console.error('Cards POST Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.cookies.get('sfm_token')?.value;
    const user = token ? await verifyAuth(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    await deleteItem('cards', id, user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Cards DELETE Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

