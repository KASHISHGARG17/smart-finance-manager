import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    env: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    },
    testQuery: null,
    error: null
  };

  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL is missing from environment variables.');
    }

    const { rows } = await sql`SELECT NOW();`;
    status.testQuery = 'Success';
    status.time = rows[0].now;
  } catch (err) {
    status.testQuery = 'Failed';
    status.error = err.message;
    status.stack = err.stack;
  }

  return NextResponse.json(status);
}
