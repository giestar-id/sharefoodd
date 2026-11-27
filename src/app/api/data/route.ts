import { NextRequest, NextResponse } from 'next/server';
import { getAllDataByToken } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
    const data = await getAllDataByToken(token);
    const res = NextResponse.json(data);
    // Clear stale/expired session cookie so middleware immediately protects routes
    if (token && !data.user) {
      res.cookies.delete(SESSION_COOKIE_NAME);
    }
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
