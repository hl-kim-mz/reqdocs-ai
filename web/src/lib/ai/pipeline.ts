import Groq from 'groq-sdk';
import { getPRDPrompt, getFeatureListPrompt, getFeatureSpecPrompt, getAPISpecPrompt, getERDPrompt } from './prompts';
import type { DocType } from '../types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateDocuments(
  rawInput: string,
  docTypes: DocType[],
  onStep: (stepId: string, status: 'active' | 'done' | 'error') => void,
  onToken: (type: DocType, token: string) => void,
  onDone: (type: DocType) => void,
  signal?: AbortSignal
) {
  const results: Record<DocType, string> = {} as Record<DocType, string>;

  const promptMap: Record<DocType, () => string> = {
    prd: () => getPRDPrompt(rawInput),
    feature_list: () => getFeatureListPrompt(rawInput),
    feature_spec: () => getFeatureSpecPrompt(rawInput),
    api_spec: () => getAPISpecPrompt(rawInput),
    erd: () => getERDPrompt(rawInput),
  };

  for (const docType of docTypes) {
    if (signal?.aborted) break;
    onStep(docType, 'active');

    try {
      let fullContent = '';

      const stream = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: promptMap[docType]() }],
        stream: true,
      });

      for await (const chunk of stream) {
        if (signal?.aborted) break;
        const token = chunk.choices[0]?.delta?.content ?? '';
        if (token) {
          fullContent += token;
          onToken(docType, token);
        }
      }

      results[docType] = fullContent;
      onDone(docType);
      onStep(docType, 'done');
    } catch (error) {
      console.error(`Error generating ${docType}:`, error);
      onStep(docType, 'error');
      throw error;
    }
  }

  return results;
}
