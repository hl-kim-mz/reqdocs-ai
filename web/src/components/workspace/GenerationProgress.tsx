'use client';

import { Loader } from 'lucide-react';
import type { GenerationStep, DocType } from '@/lib/types';

interface GenerationProgressProps {
  steps: GenerationStep[];
  streamText: Record<DocType, string>;
}

export default function GenerationProgress({
  steps,
  streamText,
}: GenerationProgressProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Steps */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          문서 생성 중...
        </h3>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100">
                {step.status === 'done' && (
                  <span className="text-green-600 font-semibold">✓</span>
                )}
                {step.status === 'active' && (
                  <Loader className="text-indigo-600 animate-spin" size={18} />
                )}
                {step.status === 'pending' && (
                  <span className="text-slate-400">•</span>
                )}
                {step.status === 'error' && (
                  <span className="text-red-600 font-semibold">✕</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {step.label}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  step.status === 'done'
                    ? 'bg-green-50 text-green-700'
                    : step.status === 'active'
                      ? 'bg-indigo-50 text-indigo-700'
                      : step.status === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-slate-50 text-slate-700'
                }`}
              >
                {step.status === 'done'
                  ? '완료'
                  : step.status === 'active'
                    ? '진행 중'
                    : step.status === 'error'
                      ? '오류'
                      : '대기 중'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {Object.entries(streamText).some(([, text]) => text.length > 0) && (
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            미리보기
          </h3>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {Object.entries(streamText).map(([type, text]) => {
              if (!text) return null;
              return (
                <div key={type} className="pb-6 border-b border-slate-200 last:border-b-0">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {type === 'prd'
                      ? 'PRD'
                      : type === 'feature_list'
                        ? '기능 목록'
                        : type}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-5">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
