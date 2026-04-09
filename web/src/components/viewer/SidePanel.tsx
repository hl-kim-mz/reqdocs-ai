'use client';

import { Copy, Download } from 'lucide-react';
import type { DocType } from '@/lib/types';

interface SidePanelProps {
  docType: DocType;
  generatedAt: string;
  content: string;
}

const docTypeLabels: Record<DocType, string> = {
  prd: 'PRD',
  feature_list: '기능 목록',
  feature_spec: '기능 명세',
  api_spec: 'API 명세',
  erd: 'ERD',
};

export default function SidePanel({
  docType,
  generatedAt,
  content,
}: SidePanelProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert('복사되었습니다.');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${docTypeLabels[docType]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formattedDate = new Date(generatedAt).toLocaleString('ko-KR');

  return (
    <div className="w-72 bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-6">
      {/* Document Info */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
          문서 정보
        </p>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-slate-500">문서 타입</p>
            <p className="text-sm font-semibold text-slate-900">
              {docTypeLabels[docType]}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">생성 시간</p>
            <p className="text-sm font-semibold text-slate-900">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-200 pt-6 space-y-3">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
        >
          <Copy size={18} />
          마크다운 복사
        </button>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
        >
          <Download size={18} />
          다운로드
        </button>
      </div>

      {/* Stats */}
      <div className="border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
          통계
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">글자 수</span>
            <span className="font-semibold text-slate-900">
              {content.length.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">단어 수</span>
            <span className="font-semibold text-slate-900">
              {content.split(/\s+/).filter((w) => w.length > 0).length.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">문단 수</span>
            <span className="font-semibold text-slate-900">
              {content.split(/\n\n+/).filter((p) => p.trim().length > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
