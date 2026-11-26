import { NextRequest, NextResponse } from 'next/server';
import { registerUserDb } from '@/lib/db';
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter.' }, { status: 400 });
    }

    const result = await registerUserDb({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      password: String(password),
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const res = NextResponse.json({ user: result.user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mendaftar.' }, { status: 500 });
  }
}
