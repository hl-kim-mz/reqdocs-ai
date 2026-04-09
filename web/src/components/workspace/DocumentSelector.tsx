'use client';

import type { DocType, SelectedDocs } from '@/lib/types';

interface DocumentSelectorProps {
  selectedDocs: SelectedDocs;
  onSelectionChange: (selected: SelectedDocs) => void;
}

const docOptions: Array<{
  type: DocType;
  label: string;
  description: string;
}> = [
  {
    type: 'prd',
    label: 'PRD',
    description: '제품 요구사항 문서',
  },
  {
    type: 'feature_list',
    label: '기능 목록',
    description: 'MoSCoW 우선순위',
  },
  {
    type: 'feature_spec',
    label: '기능 명세',
    description: '상세 기능 설명',
  },
  {
    type: 'api_spec',
    label: 'API 명세',
    description: '엔드포인트 정의',
  },
  {
    type: 'erd',
    label: 'ERD',
    description: '데이터 모델',
  },
];

export default function DocumentSelector({
  selectedDocs,
  onSelectionChange,
}: DocumentSelectorProps) {
  const handleToggle = (type: DocType) => {
    onSelectionChange({
      ...selectedDocs,
      [type]: !selectedDocs[type],
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        생성할 문서 선택
      </h3>

      <div className="space-y-3">
        {docOptions.map((option) => (
          <label
            key={option.type}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedDocs[option.type]}
              onChange={() => handleToggle(option.type)}
              className="mt-1 w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                {option.label}
              </p>
              <p className="text-xs text-slate-500">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-200">
        기본: PRD + 기능 목록
      </p>
    </div>
  );
}
