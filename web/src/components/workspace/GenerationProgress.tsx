'use client';

import { Loader, X } from 'lucide-react';
import type { GenerationStep, DocType } from '@/lib/types';

const DOC_LABELS: Record<DocType, string> = {
  prd: 'PRD',
  feature_list: '기능 목록',
  feature_spec: '기능 명세',
  api_spec: 'API 명세',
  erd: 'ERD',
};

interface GenerationProgressProps {
  steps: GenerationStep[];
  streamText: Record<DocType, string>;
  onCancel?: () => void;
}

export default function GenerationProgress({
  steps,
  streamText,
  onCancel,
}: GenerationProgressProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Steps */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">문서 생성 중...</h3>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={15} />
              취소
            </button>
          )}
        </div>

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
                <p className="text-sm font-medium text-slate-900">{step.label}</p>
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

      {/* Streaming preview */}
      {Object.entries(streamText).some(([, text]) => text.length > 0) && (
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">미리보기</h3>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {(Object.entries(streamText) as [DocType, string][]).map(([type, text]) => {
              if (!text) return null;
              return (
                <div key={type} className="pb-6 border-b border-slate-200 last:border-b-0">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {DOC_LABELS[type]}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-5">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
