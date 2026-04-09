'use client';

import { Menu } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      <div className="flex-1" />

      <div className="text-sm text-slate-600">
        ReqDocs AI v0.1.0
      </div>
    </header>
  );
}
