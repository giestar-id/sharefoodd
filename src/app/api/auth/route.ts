import { NextRequest, NextResponse } from 'next/server';
import { setActiveUser, clearActiveUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await setActiveUser(email);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearActiveUser();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
