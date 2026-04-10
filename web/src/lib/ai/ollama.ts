const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:7b';

export async function* streamOllama(
  prompt: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Ollama error ${response.status}: ${text}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
      if (data.message?.content) {
        yield data.message.content;
      }
      if (data.done) return;
    }
  }
}
