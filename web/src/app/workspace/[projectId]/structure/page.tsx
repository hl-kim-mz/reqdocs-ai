'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import AppShell from '@/components/layout/AppShell';
import RequirementList from '@/components/structure/RequirementList';
import GenerationProgress from '@/components/workspace/GenerationProgress';
import { parseSSEChunk, type SSEBuffer } from '@/lib/parseSSE';
import type { DocType, RequirementCategory, StructuredRequirement } from '@/lib/types';

const DOC_OPTIONS: { type: DocType; label: string }[] = [
  { type: 'prd', label: 'PRD' },
  { type: 'feature_list', label: '기능 목록' },
  { type: 'feature_spec', label: '기능 명세서' },
  { type: 'api_spec', label: 'API 문서' },
  { type: 'erd', label: 'ERD' },
];

const STEP_LABELS: Record<DocType, string> = {
  prd: 'PRD 생성',
  feature_list: '기능 목록 생성',
  feature_spec: '기능 명세 생성',
  api_spec: 'API 명세 생성',
  erd: 'ERD 생성',
};

export default function StructurePage() {
  const router = useRouter();
  void useParams<{ projectId: string }>();

  const {
    structuredRequirements,
    currentRawInput,
    updateRequirement,
    removeRequirement,
    addRequirement,
    setStructuredRequirements,
    setCurrentDbProjectId,
    appendStructureToken,
    clearStructureProgress,
    isGenerating,
    generationSteps,
    streamText,
    setGenerating,
    setGenerationSteps,
    updateStep,
    updateDocument,
    appendStream,
    clearStream,
    createProject,
  } = useProjectStore();

  const [selectedDocs, setSelectedDocs] = useState<Record<DocType, boolean>>({
    prd: true,
    feature_list: true,
    feature_spec: false,
    api_spec: false,
    erd: false,
  });
  const [showOriginal, setShowOriginal] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Redirect if no requirements (e.g. page refresh)
  useEffect(() => {
    if (structuredRequirements.length === 0 && !isReanalyzing) {
      router.replace('/workspace/new');
    }
  }, [structuredRequirements.length, isReanalyzing, router]);

  const handleReanalyze = async () => {
    if (!currentRawInput.trim()) return;
    if (!confirm('현재 구조화 결과를 덮어씁니다. 계속하시겠습니까?')) return;

    setIsReanalyzing(true);
    clearStructureProgress();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: currentRawInput }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('재분석 요청 실패');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const sseBuffer: SSEBuffer = { text: '' };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const events = parseSSEChunk(chunk, sseBuffer);

          for (const { event, data } of events) {
            if (event === 'start' && typeof data.projectId === 'string') {
              setCurrentDbProjectId(data.projectId);
            } else if (event === 'token' && typeof data.token === 'string') {
              appendStructureToken(data.token);
            } else if (event === 'done') {
              setStructuredRequirements(data.requirements as StructuredRequirement[]);
            } else if (event === 'error' && typeof data.message === 'string') {
              throw new Error(data.message);
            }
          }
        }
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        alert(err instanceof Error ? err.message : '재분석 중 오류가 발생했습니다.');
      }
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleGenerate = async () => {
    const docTypes = (Object.entries(selectedDocs)
      .filter(([, v]) => v)
      .map(([k]) => k) as DocType[]);

    if (docTypes.length === 0) {
      alert('생성할 문서를 선택해주세요.');
      return;
    }

    // Use Zustand local project for result tracking
    const localProjectId = createProject('구조화 프로젝트', currentRawInput);
    setGenerating(true);
    clearStream();

    setGenerationSteps(
      docTypes.map((type) => ({
        id: type,
        label: STEP_LABELS[type],
        status: 'pending' as const,
      }))
    );

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: currentRawInput,
          projectId: localProjectId,
          docTypes,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('문서 생성 실패');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const sseBuffer: SSEBuffer = { text: '' };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const events = parseSSEChunk(chunk, sseBuffer);

          for (const { event, data } of events) {
            if (event === 'step' && typeof data.id === 'string' && typeof data.status === 'string') {
              updateStep(data.id, data.status as 'active' | 'done' | 'error');
            } else if (event === 'token' && typeof data.type === 'string' && typeof data.token === 'string') {
              appendStream(data.type as DocType, data.token);
            } else if (event === 'done' && typeof data.type === 'string') {
              const docType = data.type as DocType;
              const content = useProjectStore.getState().streamText[docType];
              updateDocument(localProjectId, docType, content);
            } else if (event === 'error' && typeof data.message === 'string') {
              throw new Error(data.message);
            }
          }
        }
      }

      setGenerating(false);
      router.push(`/workspace/${localProjectId}/prd`);
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        alert(err instanceof Error ? err.message : '문서 생성 중 오류가 발생했습니다.');
      }
      setGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    abortControllerRef.current?.abort();
    setGenerating(false);
  };

  if (isGenerating) {
    return (
      <AppShell>
        <GenerationProgress
          steps={generationSteps}
          streamText={streamText}
          onCancel={handleCancelGeneration}
        />
      </AppShell>
    );
  }

  const totalCount = structuredRequirements.length;

  return (
    <AppShell>
      <div className="flex gap-6 h-full">
        {/* Main: Requirement List */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                요구사항 구조화 결과
                <span className="ml-2 text-sm font-normal text-slate-500">
                  총 {totalCount}개
                </span>
              </h2>
            </div>
            <button
              onClick={() => setShowOriginal((v) => !v)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              원본 보기
              {showOriginal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showOriginal && currentRawInput && (
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-slate-500 mb-2">원본 입력</p>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                {currentRawInput}
              </pre>
            </div>
          )}

          {isReanalyzing ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <span className="animate-spin mr-2">⟳</span>
              재분석 중...
            </div>
          ) : (
            <RequirementList
              requirements={structuredRequirements}
              onUpdate={(id, updates) => updateRequirement(id, updates)}
              onDelete={removeRequirement}
              onAdd={(category: RequirementCategory) => addRequirement(category)}
            />
          )}
        </div>

        {/* Right: Document Panel */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 mb-3">생성할 문서</h3>
            <div className="space-y-2">
              {DOC_OPTIONS.map(({ type, label }) => (
                <label
                  key={type}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs[type]}
                    onChange={(e) =>
                      setSelectedDocs((prev) => ({ ...prev, [type]: e.target.checked }))
                    }
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RotateCcw size={14} />
            재분석
          </button>

          <button
            onClick={handleGenerate}
            disabled={
              Object.values(selectedDocs).every((v) => !v) ||
              structuredRequirements.length === 0
            }
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
          >
            문서 생성 →
          </button>

          <p className="text-xs text-slate-400 text-center">
            요구사항을 검토한 후 문서를 생성하세요
          </p>
        </div>
      </div>
    </AppShell>
  );
}
