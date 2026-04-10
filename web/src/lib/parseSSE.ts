/**
 * SSE 청크 파서 — 청크 경계에서 이벤트가 잘려도 안전하게 파싱합니다.
 *
 * 사용법:
 *   const buffer = { text: '' };
 *   while (reading) {
 *     const chunk = decoder.decode(value, { stream: true });
 *     const events = parseSSEChunk(chunk, buffer);
 *     for (const { event, data } of events) { ... }
 *   }
 */

export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

export interface SSEBuffer {
  text: string;
}

export function parseSSEChunk(chunk: string, buffer: SSEBuffer): SSEEvent[] {
  buffer.text += chunk;
  const events: SSEEvent[] = [];

  // 완전한 이벤트 블록은 \n\n 으로 구분됩니다
  const blocks = buffer.text.split('\n\n');

  // 마지막 블록은 아직 완전하지 않을 수 있으므로 버퍼에 남깁니다
  buffer.text = blocks.pop() ?? '';

  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split('\n');
    let eventType = '';
    let dataStr = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        dataStr = line.slice(6);
      }
    }

    if (!eventType || !dataStr) continue;

    try {
      events.push({ event: eventType, data: JSON.parse(dataStr) as Record<string, unknown> });
    } catch {
      // 파싱 실패 시 무시
    }
  }

  return events;
}
