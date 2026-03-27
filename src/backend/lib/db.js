import { sql } from '@vercel/postgres';

const isDatabaseConfigured = !!process.env.POSTGRES_URL;

/**
 * DATABASE SCHEMA INITIALIZATION
 * Run this on the first deploy to create all tables.
 */
export async function initDB() {
  if (!isDatabaseConfigured) {
    console.warn('[DB] POSTGRES_URL is not set. Skipping initialization.');
    return;
  }
  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Cards table
    await sql`
      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        bank_name TEXT NOT NULL,
        last_four TEXT NOT NULL,
        type TEXT NOT NULL,
        card_holder TEXT NOT NULL
      );
    `;

    // 4. Dues table
    await sql`
      CREATE TABLE IF NOT EXISTS dues (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        title TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'unpaid'
      );
    `;

    // 5. Budgets table
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        category TEXT NOT NULL,
        limit_amount NUMERIC NOT NULL
      );
    `;

    // 6. Financial Goals table
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        title TEXT NOT NULL,
        target_amount NUMERIC NOT NULL,
        current_amount NUMERIC DEFAULT 0
      );
    `;

    console.log('[DB] All tables verified/created successfully.');
  } catch (error) {
    console.error('[DB] Schema Error:', error);
  }
}

/**
 * COMPATIBILITY LAYER
 * These functions bridge the gap between the old JSON system and Postgres.
 * Note: Since Postgres is relational, we will move away from "Collections" 
 * and towards direct SQL queries for efficiency.
 */

export async function getUserByEmail(email) {
  if (!isDatabaseConfigured) return null;
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email};`;
  return rows[0];
}

export async function createUser(user) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.role});
  `;
  return user;
}

export async function getTransactions(userId) {
  if (!isDatabaseConfigured) return { balance: 0, transactions: [] };
  const { rows } = await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY date DESC;`;
  
  // Calculate balance efficiently
  let balance = 0;
  rows.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === 'income') balance += amt;
    else balance -= amt;
  });

  return { balance, transactions: rows };
}

export async function insertTransaction(tx) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`
    INSERT INTO transactions (id, user_id, amount, type, category, description, date)
    VALUES (${tx.id}, ${tx.userId}, ${tx.amount}, ${tx.type}, ${tx.category || 'other'}, ${tx.description}, ${tx.date});
  `;
}


// --- Cards ---
export async function getCards(userId) {
  if (!isDatabaseConfigured) return [];
  const { rows } = await sql`SELECT * FROM cards WHERE user_id = ${userId};`;
  return rows;
}

export async function insertCard(card) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`
    INSERT INTO cards (id, user_id, bank_name, last_four, type, card_holder)
    VALUES (${card.id}, ${card.userId}, ${card.bankName}, ${card.lastFour}, ${card.type}, ${card.cardHolder});
  `;
}

// --- Dues ---
export async function getDues(userId) {
  if (!isDatabaseConfigured) return [];
  const { rows } = await sql`SELECT * FROM dues WHERE user_id = ${userId} ORDER BY due_date ASC;`;
  return rows;
}

export async function insertDue(due) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`
    INSERT INTO dues (id, user_id, title, amount, due_date, status)
    VALUES (${due.id}, ${due.userId}, ${due.title}, ${due.amount}, ${due.dueDate}, ${due.status || 'unpaid'});
  `;
}

export async function updateDueStatus(id, userId, status) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`UPDATE dues SET status = ${status} WHERE id = ${id} AND user_id = ${userId};`;
}

// --- Budgets ---
export async function getBudgets(userId) {
  if (!isDatabaseConfigured) return [];
  const { rows } = await sql`SELECT * FROM budgets WHERE user_id = ${userId};`;
  return rows;
}

export async function insertBudget(budget) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`
    INSERT INTO budgets (id, user_id, category, limit_amount)
    VALUES (${budget.id}, ${budget.userId}, ${budget.category}, ${budget.limitAmount});
  `;
}

// --- Goals ---
export async function getGoals(userId) {
  if (!isDatabaseConfigured) return [];
  const { rows } = await sql`SELECT * FROM goals WHERE user_id = ${userId};`;
  return rows;
}

export async function insertGoal(goal) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  await sql`
    INSERT INTO goals (id, user_id, title, target_amount, current_amount)
    VALUES (${goal.id}, ${goal.userId}, ${goal.title}, ${goal.targetAmount}, ${goal.currentAmount || 0});
  `;
}

export async function deleteItem(table, id, userId) {
  if (!isDatabaseConfigured) throw new Error('Database not configured');
  // Dangerous but controlled approach for this sandbox
  if (table === 'transactions') await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'cards') await sql`DELETE FROM cards WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'dues') await sql`DELETE FROM dues WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'budgets') await sql`DELETE FROM budgets WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'goals') await sql`DELETE FROM goals WHERE id = ${id} AND user_id = ${userId};`;
}


