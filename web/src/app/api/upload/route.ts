import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });
  }

  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  // Determine type from extension if MIME type is generic
  const isTextFile = mimeType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md');
  const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');
  const isDocx =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx');

  if (!isTextFile && !isPdf && !isDocx) {
    return Response.json(
      { error: 'txt, md, pdf, docx 형식만 지원합니다.' },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';

    if (isTextFile) {
      text = buffer.toString('utf-8');
    } else if (isPdf) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (isDocx) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    text = text.trim();
    if (!text) {
      return Response.json({ error: '파일에서 텍스트를 추출할 수 없습니다.' }, { status: 400 });
    }

    return Response.json({ text, fileName: file.name });
  } catch (err) {
    console.error('[upload]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
