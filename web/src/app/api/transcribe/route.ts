import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SUPPORTED_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/wav',
  'audio/webm',
  'video/mp4',
  'video/webm',
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  if (file.size > 25 * 1024 * 1024) {
    return Response.json({ error: '파일 크기는 25MB 이하여야 합니다.' }, { status: 400 });
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return Response.json(
      { error: 'mp3, mp4, m4a, wav, webm 형식만 지원합니다.' },
      { status: 400 }
    );
  }

  try {
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      language: 'ko',
      response_format: 'text',
    });

    return Response.json({ text: transcription });
  } catch (err) {
    console.error('[transcribe]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : '변환 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
