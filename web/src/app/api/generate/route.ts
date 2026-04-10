import { generateDocuments } from '@/lib/ai/pipeline';
import type { DocType } from '@/lib/types';

const STEP_LABELS: Record<DocType, string> = {
  prd: 'PRD 생성',
  feature_list: '기능 목록 생성',
  feature_spec: '기능 명세 생성',
  api_spec: 'API 명세 생성',
  erd: 'ERD 생성',
};

export async function POST(request: Request) {
  const { rawInput, projectId, docTypes } = await request.json() as {
    rawInput: string;
    projectId: string;
    docTypes: DocType[];
  };

  if (!rawInput || !projectId || !docTypes || docTypes.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create a custom ReadableStream for SSE
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const encoder = new TextEncoder();

        // Emit step updates and tokens via SSE
        const onStep = (stepId: string, status: 'active' | 'done' | 'error') => {
          const event = `event: step\ndata: ${JSON.stringify({ id: stepId, status })}\n\n`;
          controller.enqueue(encoder.encode(event));
        };

        const onToken = (type: DocType, token: string) => {
          const event = `event: token\ndata: ${JSON.stringify({ type, token })}\n\n`;
          controller.enqueue(encoder.encode(event));
        };

        const onDone = (type: DocType) => {
          const event = `event: done\ndata: ${JSON.stringify({ type })}\n\n`;
          controller.enqueue(encoder.encode(event));
        };

        // Initialize steps
        const stepEvent = `event: init\ndata: ${JSON.stringify({
          steps: docTypes.map((type) => ({
            id: type,
            label: STEP_LABELS[type],
            status: 'pending',
          })),
        })}\n\n`;
        controller.enqueue(encoder.encode(stepEvent));

        // Generate documents
        await generateDocuments(
          rawInput,
          docTypes,
          onStep,
          onToken,
          onDone,
          request.signal
        );

        // Signal completion
        const completeEvent = `event: complete\ndata: ${JSON.stringify({ success: true })}\n\n`;
        controller.enqueue(encoder.encode(completeEvent));

        controller.close();
      } catch (error) {
        const encoder = new TextEncoder();
        const message = error instanceof Error ? error.message : 'Unknown error';
        const errorEvent = `event: error\ndata: ${JSON.stringify({ message })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
