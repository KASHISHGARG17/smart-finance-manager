import { createPool, createClient } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';

const JSON_DB_PATH = path.join(process.cwd(), 'database', 'data.json');
const isDatabaseConfigured = !!process.env.POSTGRES_URL;

// Lazy initialization to avoid build-time errors
let _pool = null;
let _client = null;

async function getDb() {
  if (_pool) return _pool;
  if (_client) return _client;

  if (!isDatabaseConfigured) return null;

  try {
    // Try pooled first
    _pool = createPool();
    return _pool;
  } catch (err) {
    if (err.message.includes('invalid_connection_string')) {
      console.warn('[DB] Pooled connection failed, falling back to direct client.');
      _client = createClient();
      await _client.connect();
      return _client;
    }
    throw err;
  }
}

const sql = async (strings, ...values) => {
  const db = await getDb();
  if (!db) throw new Error('Database not configured');
  // Both pool and client have the .sql tag in @vercel/postgres
  return await db.sql(strings, ...values);
};



async function getLocalData() {
  try {
    const data = JSON.parse(await fs.readFile(JSON_DB_PATH, 'utf-8'));
    // Ensure critical keys exist
    if (!data.users) data.users = [];
    if (!data.transactions) data.transactions = [];
    if (!data.cards) data.cards = [];
    if (!data.dues) data.dues = [];
    if (!data.budgets) data.budgets = [];
    if (!data.goals) data.goals = [];

    // Add default admin if empty for testing
    if (data.users.length === 0) {
      data.users.push({
        id: 'admin-id',
        name: 'Admin',
        email: 'admin@fintrack.com',
        password: 'admin123',
        role: 'admin'
      });
      await saveLocalData(data);
    }
    return data;
  } catch (e) {
    const defaultData = { 
      users: [{ id: 'admin-id', name: 'Admin', email: 'admin@fintrack.com', password: 'admin123', role: 'admin' }], 
      transactions: [], cards: [], dues: [], budgets: [], goals: [] 
    };
    await saveLocalData(defaultData);
    return defaultData;
  }
}


async function saveLocalData(data) {
  await fs.mkdir(path.dirname(JSON_DB_PATH), { recursive: true }).catch(() => {});
  await fs.writeFile(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

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
        id TEXT PRIMARY KEY,
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
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
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
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        bank_name TEXT NOT NULL,
        last_four TEXT NOT NULL,
        type TEXT NOT NULL,
        card_holder TEXT NOT NULL
      );
    `;

    // 4. Dues table
    await sql`
      CREATE TABLE IF NOT EXISTS dues (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'unpaid'
      );
    `;

    // 5. Budgets table
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        category TEXT NOT NULL,
        limit_amount NUMERIC NOT NULL
      );
    `;

    // 6. Financial Goals table
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        target_amount NUMERIC NOT NULL,
        current_amount NUMERIC DEFAULT 0
      );
    `;

    console.log('[DB] All tables verified/created successfully.');
  } catch (error) {
    console.error('[DB] Schema Error:', error);
    throw error; // Re-throw to allow API routes to catch and report it
  }
}


/**
 * COMPATIBILITY LAYER
 * These functions bridge the gap between the old JSON system and Postgres.
 * Note: Since Postgres is relational, we will move away from "Collections" 
 * and towards direct SQL queries for efficiency.
 */

export async function getUserByEmail(email) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.users.find(u => u.email === email) || null;
  }
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email};`;
  return rows[0];
}

export async function getUserById(id) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.users.find(u => u.id === id) || null;
  }
  const { rows } = await sql`SELECT * FROM users WHERE id = ${id};`;
  return rows[0];
}

export async function getAllUsers() {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.users;
  }
  const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC;`;
  return rows;
}




export async function createUser(user) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    data.users.push(user);
    await saveLocalData(data);
    return user;
  }
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.role});
  `;
  return user;
}


export async function getTransactions(userId) {
  let rows = [];
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    rows = data.transactions.filter(t => t.userId === userId);
  } else {
    const { rows: result } = await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY date DESC;`;
    rows = result;
  }
  
  // Calculate balance efficiently
  let balance = 0;
  rows.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === 'income') balance += amt;
    else balance -= amt;
  });

  return { balance, transactions: rows };
}


export async function getAllTransactions() {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.transactions;
  }
  const { rows } = await sql`SELECT * FROM transactions ORDER BY date DESC;`;
  return rows;
}



export async function insertTransaction(tx) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    data.transactions.unshift(tx);
    await saveLocalData(data);
    return;
  }
  await sql`
    INSERT INTO transactions (id, user_id, amount, type, category, description, date)
    VALUES (${tx.id}, ${tx.userId}, ${tx.amount}, ${tx.type}, ${tx.category || 'other'}, ${tx.description}, ${tx.date});
  `;
}



// --- Cards ---
export async function getCards(userId) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.cards.filter(c => c.userId === userId);
  }
  const { rows } = await sql`SELECT * FROM cards WHERE user_id = ${userId};`;
  return rows;
}

export async function insertCard(card) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    data.cards.push(card);
    await saveLocalData(data);
    return;
  }
  await sql`
    INSERT INTO cards (id, user_id, bank_name, last_four, type, card_holder)
    VALUES (${card.id}, ${card.userId}, ${card.bankName}, ${card.lastFour}, ${card.type}, ${card.cardHolder});
  `;
}


// --- Dues ---
export async function getDues(userId) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.dues.filter(d => d.userId === userId);
  }
  const { rows } = await sql`SELECT * FROM dues WHERE user_id = ${userId} ORDER BY due_date ASC;`;
  return rows;
}

export async function insertDue(due) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    data.dues.push(due);
    await saveLocalData(data);
    return;
  }
  await sql`
    INSERT INTO dues (id, user_id, title, amount, due_date, status)
    VALUES (${due.id}, ${due.userId}, ${due.title}, ${due.amount}, ${due.dueDate}, ${due.status || 'unpaid'});
  `;
}

export async function updateDueStatus(id, userId, status) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    const index = data.dues.findIndex(d => d.id === id && d.userId === userId);
    if (index !== -1) {
      data.dues[index].status = status;
      await saveLocalData(data);
    }
    return;
  }
  await sql`UPDATE dues SET status = ${status} WHERE id = ${id} AND user_id = ${userId};`;
}


// --- Budgets ---
export async function getBudgets(userId) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.budgets.filter(b => b.userId === userId);
  }
  const { rows } = await sql`SELECT * FROM budgets WHERE user_id = ${userId};`;
  return rows;
}

export async function insertBudget(budget) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    data.budgets.push(budget);
    await saveLocalData(data);
    return;
  }
  await sql`
    INSERT INTO budgets (id, user_id, category, limit_amount)
    VALUES (${budget.id}, ${budget.userId}, ${budget.category}, ${budget.limitAmount});
  `;
}

// --- Goals ---
export async function getGoals(userId) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    return data.goals.filter(g => g.userId === userId);
  }
  const { rows } = await sql`SELECT * FROM goals WHERE user_id = ${userId};`;
  return rows;
}

export async function insertGoal(goal) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    data.goals.push(goal);
    await saveLocalData(data);
    return;
  }
  await sql`
    INSERT INTO goals (id, user_id, title, target_amount, current_amount)
    VALUES (${goal.id}, ${goal.userId}, ${goal.title}, ${goal.targetAmount}, ${goal.currentAmount || 0});
  `;
}

export async function deleteItem(table, id, userId) {
  if (!isDatabaseConfigured) {
    const data = await getLocalData();
    if (data[table]) {
      data[table] = data[table].filter(item => !(item.id === id && item.userId === userId));
      await saveLocalData(data);
    }
    return;
  }
  // Dangerous but controlled approach for this sandbox
  if (table === 'transactions') await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'cards') await sql`DELETE FROM cards WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'dues') await sql`DELETE FROM dues WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'budgets') await sql`DELETE FROM budgets WHERE id = ${id} AND user_id = ${userId};`;
  if (table === 'goals') await sql`DELETE FROM goals WHERE id = ${id} AND user_id = ${userId};`;
}



