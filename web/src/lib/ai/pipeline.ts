import Anthropic from '@anthropic-ai/sdk';
import { getPRDPrompt, getFeatureListPrompt } from './prompts';
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
      let prompt = '';
      if (docType === 'prd') {
        prompt = getPRDPrompt(rawInput);
      } else if (docType === 'feature_list') {
        prompt = getFeatureListPrompt(rawInput);
      } else {
        // For other doc types, use a generic prompt
        prompt = `사용자 요구사항을 바탕으로 ${docType}를 작성하세요:\n\n${rawInput}`;
      }

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
