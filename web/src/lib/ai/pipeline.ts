import Anthropic from '@anthropic-ai/sdk';
import { getPRDPrompt, getFeatureListPrompt, getFeatureSpecPrompt, getAPISpecPrompt, getERDPrompt } from './prompts';
import type { DocType } from '../types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateDocuments(
  rawInput: string,
  docTypes: DocType[],
  onStep: (stepId: string, status: 'active' | 'done' | 'error') => void,
  onToken: (type: DocType, token: string) => void,
  onDone: (type: DocType) => void
) {
  const results: Record<DocType, string> = {} as Record<DocType, string>;

  for (const docType of docTypes) {
    onStep(docType, 'active');

    try {
      const promptMap: Record<DocType, () => string> = {
        prd: () => getPRDPrompt(rawInput),
        feature_list: () => getFeatureListPrompt(rawInput),
        feature_spec: () => getFeatureSpecPrompt(rawInput),
        api_spec: () => getAPISpecPrompt(rawInput),
        erd: () => getERDPrompt(rawInput),
      };
      const prompt = promptMap[docType]();

      let fullContent = '';

      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const token = event.delta.text;
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
