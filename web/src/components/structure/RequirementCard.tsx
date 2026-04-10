'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { StructuredRequirement, MoSCoWPriority } from '@/lib/types';

const PRIORITY_OPTIONS: MoSCoWPriority[] = [
  'Must Have',
  'Should Have',
  'Could Have',
  "Won't Have",
];

const PRIORITY_COLORS: Record<MoSCoWPriority, string> = {
  'Must Have': 'bg-red-100 text-red-700 border-red-200',
  'Should Have': 'bg-orange-100 text-orange-700 border-orange-200',
  'Could Have': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  "Won't Have": 'bg-slate-100 text-slate-500 border-slate-200',
};

interface RequirementCardProps {
  req: StructuredRequirement;
  onUpdate: (id: string, updates: Partial<Omit<StructuredRequirement, 'id' | 'order'>>) => void;
  onDelete: (id: string) => void;
}

export default function RequirementCard({
  req,
  onUpdate,
  onDelete,
}: RequirementCardProps) {
  const [isEditing, setIsEditing] = useState(req.title === '');
  const [editTitle, setEditTitle] = useState(req.title);
  const [editDesc, setEditDesc] = useState(req.description);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(req.id, { title: editTitle.trim(), description: editDesc.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!req.title) {
      onDelete(req.id);
      return;
    }
    setEditTitle(req.title);
    setEditDesc(req.description);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-slate-400 shrink-0">{req.id}</span>
          <select
            value={req.priority}
            onChange={(e) => onUpdate(req.id, { priority: e.target.value as MoSCoWPriority })}
            className={`text-xs px-2 py-0.5 rounded border font-medium cursor-pointer ${PRIORITY_COLORS[req.priority]}`}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                title="편집"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(req.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                title="삭제"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="저장"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                title="취소"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="요구사항 제목"
            className="w-full text-sm font-medium px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="상세 설명 (선택)"
            rows={2}
            className="w-full text-sm text-slate-600 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-900 mb-1">{req.title || '(제목 없음)'}</p>
          {req.description && (
            <p className="text-xs text-slate-500 leading-relaxed">{req.description}</p>
          )}
          {req.source && (
            <p className="text-xs text-slate-400 mt-2 italic border-l-2 border-slate-200 pl-2">
              출처: {req.source}
            </p>
          )}
        </>
      )}
    </div>
  );
}
