import Groq from 'groq-sdk';
import { getStructurePrompt } from './prompts';
import type { StructuredRequirement, RequirementCategory, MoSCoWPriority } from '../types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_CATEGORIES: RequirementCategory[] = [
  '기능 요구사항',
  '비기능 요구사항',
  '제약사항',
];
const VALID_PRIORITIES: MoSCoWPriority[] = [
  'Must Have',
  'Should Have',
  'Could Have',
  "Won't Have",
];

export async function structureRequirements(
  rawInput: string,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<{ domain: string; purpose: string; requirements: StructuredRequirement[] }> {
  let fullContent = '';

  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: getStructurePrompt(rawInput) }],
    stream: true,
  });

  for await (const chunk of stream) {
    if (signal?.aborted) break;
    const token = chunk.choices[0]?.delta?.content ?? '';
    if (token) {
      fullContent += token;
      onToken(token);
    }
  }

  // Extract JSON (handle markdown code blocks)
  const jsonMatch =
    fullContent.match(/```json\s*([\s\S]*?)```/) ||
    fullContent.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error('구조화 결과를 파싱할 수 없습니다. 다시 시도해주세요.');
  }

  const rawJson = jsonMatch[1] ?? jsonMatch[0];

  // LLM이 JSON 문자열 내부에 제어문자를 그대로 출력하는 경우 정제
  const jsonStr = rawJson.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/[\u0000-\u001F]/g, (c) => {
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      return `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(jsonStr) as Record<string, any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requirements: StructuredRequirement[] = ((parsed.requirements as any[]) ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any, index: number): StructuredRequirement => ({
      id: String(r.id ?? `REQ-${String(index + 1).padStart(3, '0')}`),
      category: VALID_CATEGORIES.includes(r.category)
        ? (r.category as RequirementCategory)
        : '기능 요구사항',
      title: String(r.title ?? ''),
      description: String(r.description ?? ''),
      priority: VALID_PRIORITIES.includes(r.priority)
        ? (r.priority as MoSCoWPriority)
        : 'Should Have',
      source: r.source && r.source !== 'null' ? String(r.source) : undefined,
      order: index,
    })
  );

  return {
    domain: String(parsed.domain ?? ''),
    purpose: String(parsed.purpose ?? ''),
    requirements,
  };
}
