'use client';

import { Plus } from 'lucide-react';
import type { StructuredRequirement, RequirementCategory } from '@/lib/types';
import RequirementCard from './RequirementCard';

const CATEGORIES: { key: RequirementCategory; label: string; color: string }[] = [
  { key: '기능 요구사항', label: '기능 요구사항', color: 'bg-green-500' },
  { key: '비기능 요구사항', label: '비기능 요구사항', color: 'bg-blue-500' },
  { key: '제약사항', label: '제약사항', color: 'bg-red-500' },
];

interface RequirementListProps {
  requirements: StructuredRequirement[];
  onUpdate: (id: string, updates: Partial<Omit<StructuredRequirement, 'id' | 'order'>>) => void;
  onDelete: (id: string) => void;
  onAdd: (category: RequirementCategory) => void;
}

export default function RequirementList({
  requirements,
  onUpdate,
  onDelete,
  onAdd,
}: RequirementListProps) {
  return (
    <div className="space-y-8">
      {CATEGORIES.map(({ key, label, color }) => {
        const items = requirements
          .filter((r) => r.category === key)
          .sort((a, b) => a.order - b.order);

        return (
          <section key={key}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => onAdd(key)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
              >
                <Plus size={13} />
                항목 추가
              </button>
            </div>

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center text-xs text-slate-400">
                항목 없음 — 추가 버튼으로 직접 입력하세요
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((req) => (
                  <RequirementCard
                    key={req.id}
                    req={req}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
