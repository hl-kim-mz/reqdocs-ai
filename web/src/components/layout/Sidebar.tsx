'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { FileText, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useProjectStore((state) => state.projects);

  const isNewWorkspace = pathname === '/workspace/new';

  return (
    <aside
      className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-60' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600">ReqDocs AI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <button
          onClick={() => router.push('/workspace/new')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isNewWorkspace
              ? 'bg-indigo-50 text-indigo-600 font-semibold'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Plus size={20} />
          <span>새 프로젝트</span>
        </button>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">
              최근 프로젝트
            </p>
            <div className="space-y-1">
              {projects.slice(-5).reverse().map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${project.id}/prd`}
                  className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm truncate"
                >
                  <FileText size={16} className="flex-shrink-0" />
                  <span className="truncate">{project.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm">
          <Settings size={18} />
          <span>설정</span>
        </button>
      </div>
    </aside>
  );
}
