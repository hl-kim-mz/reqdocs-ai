'use client';

import { Menu, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      <div className="flex-1" />

      {session?.user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
            {session.user.name ?? session.user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={15} />
            로그아웃
          </button>
        </div>
      ) : (
        <span className="text-sm text-slate-400">ReqDocs AI v0.1.0</span>
      )}
    </header>
  );
}
