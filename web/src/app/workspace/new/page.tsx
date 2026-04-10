'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import AppShell from '@/components/layout/AppShell';
import RequirementsEditor from '@/components/workspace/RequirementsEditor';
import DocumentSelector from '@/components/workspace/DocumentSelector';
import GenerationProgress from '@/components/workspace/GenerationProgress';
import type { DocType } from '@/lib/types';

export default function WorkspacePage() {
  const router = useRouter();
  const [title, setTitle] = useState('새 프로젝트');
  const [input, setInput] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Record<DocType, boolean>>({
    prd: true,
    feature_list: true,
    feature_spec: false,
    api_spec: false,
    erd: false,
  });

  const {
    createProject,
    setGenerating,
    isGenerating,
    generationSteps,
    streamText,
    setGenerationSteps,
    updateDocument,
    appendStream,
    clearStream,
  } = useProjectStore();

  const STEP_LABELS: Record<DocType, string> = {
    prd: 'PRD 생성',
    feature_list: '기능 목록 생성',
    feature_spec: '기능 명세 생성',
    api_spec: 'API 명세 생성',
    erd: 'ERD 생성',
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      alert('요구사항을 입력해주세요.');
      return;
    }

    const docTypesToGenerate = (
      Object.entries(selectedDocs)
        .filter(([, isSelected]) => isSelected)
        .map(([type]) => type) as DocType[]
    );

    if (docTypesToGenerate.length === 0) {
      alert('생성할 문서를 선택해주세요.');
      return;
    }

    const projectId = createProject(title, input);
    setGenerating(true);
    clearStream();

    // Initialize steps
    setGenerationSteps(
      docTypesToGenerate.map((type) => ({
        id: type,
        label: STEP_LABELS[type],
        status: 'pending' as const,
      }))
    );

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: input,
          projectId,
          docTypes: docTypesToGenerate,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              const dataLine = lines[i + 1];

              if (dataLine?.startsWith('data: ')) {
                const data = JSON.parse(dataLine.slice(6));

                if (eventType === 'step') {
                  // Handle step updates (managed server-side)
                } else if (eventType === 'token' && 'type' in data && 'token' in data) {
                  appendStream(data.type as DocType, data.token as string);
                } else if (eventType === 'done' && 'type' in data) {
                  // Finalize document
                  const docType = data.type as DocType;
                  const content = useProjectStore.getState().streamText[docType];
                  updateDocument(projectId, docType, content);
                }
              }
            }
          }
        }
      }

      // Redirect to result page
      setGenerating(false);
      router.push(`/workspace/${projectId}/prd`);
    } catch (error) {
      console.error('Error:', error);
      setGenerating(false);
      alert('문서 생성 중 오류가 발생했습니다.');
    }
  };

  if (isGenerating) {
    return (
      <AppShell>
        <GenerationProgress steps={generationSteps} streamText={streamText} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex gap-8 h-full">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              프로젝트 이름
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <RequirementsEditor value={input} onChange={setInput} />
        </div>

        {/* Right: Document Selector */}
        <div className="w-80 flex flex-col gap-6">
          <DocumentSelector
            selectedDocs={selectedDocs}
            onSelectionChange={setSelectedDocs}
          />

          <button
            onClick={handleGenerate}
            disabled={!input.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
          >
            문서 생성
          </button>
        </div>
      </div>
    </AppShell>
  );
}
