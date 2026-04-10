import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { structureRequirements } from '@/lib/ai/structurer';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await request.json()) as { rawInput?: string; title?: string };
  const { rawInput: rawInputOriginal, title } = body;

  if (!rawInputOriginal?.trim()) {
    return Response.json({ error: 'rawInput이 필요합니다.' }, { status: 400 });
  }

  // Groq 무료 티어 TPM 한도(6000) 보호: 한국어 기준 1자≈2토큰 → 2000자 이내
  const MAX_INPUT_CHARS = 2000;
  const truncated = rawInputOriginal.length > MAX_INPUT_CHARS;
  const rawInput = truncated
    ? rawInputOriginal.slice(0, MAX_INPUT_CHARS)
    : rawInputOriginal;

  // Create project in DB
  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title: title?.trim() || '새 프로젝트',
      rawInput,
    },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send('start', { projectId: project.id });

      try {
        const result = await structureRequirements(
          rawInput,
          (token) => send('token', { token }),
          request.signal
        );

        // Save structured requirements to DB
        if (result.requirements.length > 0) {
          await prisma.structuredRequirement.createMany({
            data: result.requirements.map((r) => ({
              projectId: project.id,
              reqId: r.id,
              category: r.category,
              title: r.title,
              description: r.description,
              priority: r.priority,
              source: r.source ?? null,
              order: r.order,
            })),
          });
        }

        send('done', {
          projectId: project.id,
          domain: result.domain,
          purpose: result.purpose,
          requirements: result.requirements,
          truncated,
        });
      } catch (err) {
        console.error('[structure]', err);
        send('error', {
          message:
            err instanceof Error
              ? err.message
              : '요구사항 구조화 중 오류가 발생했습니다.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
