import { NextRequest, NextResponse } from 'next/server';
import { getAllData, getUserBySessionTokenDb } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = token ? await getUserBySessionTokenDb(token) : null;
    const data = await getAllData(sessionUser?.id ?? null);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
