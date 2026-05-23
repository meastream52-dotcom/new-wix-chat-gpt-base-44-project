import { NextResponse } from 'next/server';
import { getSession } from '@/lib/blog-auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
