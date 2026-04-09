'use client';

import Link from 'next/link';
import type { DocType } from '@/lib/types';

interface DocumentTabBarProps {
  projectId: string;
  availableTabs: DocType[];
  currentTab: DocType;
}

const tabLabels: Record<DocType, string> = {
  prd: 'PRD',
  feature_list: '기능 목록',
  feature_spec: '기능 명세',
  api_spec: 'API 명세',
  erd: 'ERD',
};

export default function DocumentTabBar({
  projectId,
  availableTabs,
  currentTab,
}: DocumentTabBarProps) {
  return (
    <div className="flex gap-2 border-b border-slate-200">
      {availableTabs.map((tab) => (
        <Link
          key={tab}
          href={`/workspace/${projectId}/${tab}`}
          className={`px-4 py-3 border-b-2 transition-colors ${
            currentTab === tab
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {tabLabels[tab]}
        </Link>
      ))}
    </div>
  );
}
