'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import AppShell from '@/components/layout/AppShell';
import RequirementsEditor from '@/components/workspace/RequirementsEditor';
import AudioUpload from '@/components/workspace/AudioUpload';
import FileUpload from '@/components/workspace/FileUpload';
import { parseSSEChunk, type SSEBuffer } from '@/lib/parseSSE';
import type { StructuredRequirement } from '@/lib/types';

export default function WorkspacePage() {
  const router = useRouter();
  const [title, setTitle] = useState('새 프로젝트');
  const [input, setInput] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    setCurrentDbProjectId,
    setCurrentRawInput,
    setStructuredRequirements,
    isStructuring,
    setStructuring,
    structureProgress,
    appendStructureToken,
    clearStructureProgress,
  } = useProjectStore();

  const handleStructure = async () => {
    if (!input.trim()) {
      alert('요구사항을 입력해주세요.');
      return;
    }

    setStructuring(true);
    clearStructureProgress();
    setCurrentRawInput(input);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: input, title }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`[${response.status}] ${errText || '구조화 요청 실패'}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const sseBuffer: SSEBuffer = { text: '' };
      let projectId = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const events = parseSSEChunk(chunk, sseBuffer);

          for (const { event, data } of events) {
            if (event === 'start' && typeof data.projectId === 'string') {
              projectId = data.projectId;
              setCurrentDbProjectId(projectId);
            } else if (event === 'token' && typeof data.token === 'string') {
              appendStructureToken(data.token);
            } else if (event === 'done') {
              const reqs = data.requirements as StructuredRequirement[];
              setStructuredRequirements(reqs);
            } else if (event === 'error' && typeof data.message === 'string') {
              throw new Error(data.message);
            }
          }
        }
      }

      setStructuring(false);
      if (projectId) {
        router.push(`/workspace/${projectId}/structure`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // cancelled
      } else {
        console.error('[structure]', error);
        alert(error instanceof Error ? error.message : '오류가 발생했습니다.');
      }
      setStructuring(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setStructuring(false);
  };

  if (isStructuring) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-12">
            <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              요구사항 분석 중...
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              AI가 입력 내용을 분석하여 요구사항을 구조화하고 있습니다.
            </p>
            {structureProgress && (
              <div className="text-left bg-slate-50 rounded-lg p-4 max-h-48 overflow-hidden text-xs text-slate-400 font-mono">
                {structureProgress.slice(-500)}
              </div>
            )}
            <button
              onClick={handleCancel}
              className="mt-6 px-4 py-2 text-sm text-slate-600 hover:text-red-600 border border-slate-300 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
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
          <AudioUpload
            onTranscribed={(text) =>
              setInput((prev) => prev ? `${prev}\n\n${text}` : text)
            }
          />
          <FileUpload
            onExtracted={(text) =>
              setInput((prev) => prev ? `${prev}\n\n${text}` : text)
            }
          />
        </div>

        {/* Right: Action Panel */}
        <div className="w-72 flex flex-col gap-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">입력 가이드</h3>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>• 회의록, 이메일, 기획 메모 등 자유롭게 붙여넣기</li>
              <li>• 정리되지 않아도 됩니다</li>
              <li>• AI가 요구사항을 자동 분류합니다</li>
              <li>• 검토 후 문서 생성을 선택합니다</li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">생성 흐름</h3>
            <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>비정형 입력</li>
              <li className="text-indigo-600 font-medium">AI 요구사항 구조화</li>
              <li>기획자 검토 · 편집</li>
              <li>개발 문서 자동 생성</li>
            </ol>
          </div>

          <button
            onClick={handleStructure}
            disabled={!input.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
          >
            ⚡ 요구사항 구조화 시작
          </button>
        </div>
      </div>
    </AppShell>
  );
}
