'use client';

import { useParams } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import AppShell from '@/components/layout/AppShell';
import DocumentTabBar from '@/components/viewer/DocumentTabBar';
import MarkdownViewer from '@/components/viewer/MarkdownViewer';
import SidePanel from '@/components/viewer/SidePanel';
import type { DocType } from '@/lib/types';

export default function WorkspaceViewerPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const tab = params.tab as DocType;

  const project = useProjectStore((state) =>
    state.projects.find((p) => p.id === projectId)
  );

  if (!project) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-600">프로젝트를 찾을 수 없습니다.</p>
        </div>
      </AppShell>
    );
  }

  const availableTabs = (
    Object.entries(project.documents) as [DocType, typeof project.documents[DocType]][]
  )
    .filter(([, doc]) => doc !== null)
    .map(([type]) => type);

  const currentDoc = project.documents[tab];

  return (
    <AppShell>
      <div className="flex gap-6 h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          <DocumentTabBar
            projectId={projectId}
            availableTabs={availableTabs}
            currentTab={tab}
          />

          {currentDoc ? (
            <MarkdownViewer content={currentDoc.content} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-600">문서를 선택해주세요.</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {currentDoc && (
          <SidePanel
            docType={tab}
            generatedAt={currentDoc.generatedAt}
            content={currentDoc.content}
          />
        )}
      </div>
    </AppShell>
  );
}
