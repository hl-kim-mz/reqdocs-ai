import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json() as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      return Response.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: '올바른 이메일 형식을 입력해주세요.' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name?.trim() || null },
    });

    return Response.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
