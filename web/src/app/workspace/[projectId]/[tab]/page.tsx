'use client';

import { useState, useRef } from 'react';
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
  const updateDocument = useProjectStore((state) => state.updateDocument);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regenAbortRef = useRef<AbortController | null>(null);

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

  const handleEditStart = () => {
    setEditContent(currentDoc?.content ?? '');
    setIsEditing(true);
  };

  const handleEditSave = () => {
    updateDocument(projectId, tab, editContent);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    const controller = new AbortController();
    regenAbortRef.current = controller;

    let buffer = '';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: project.rawInput,
          projectId,
          docTypes: [tab],
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              const dataLine = lines[i + 1];
              if (dataLine?.startsWith('data: ')) {
                const data = JSON.parse(dataLine.slice(6));
                if (eventType === 'token' && 'token' in data) {
                  buffer += data.token as string;
                } else if (eventType === 'done') {
                  updateDocument(projectId, tab, buffer);
                  buffer = '';
                }
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Regeneration error:', error);
        alert('재생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="flex gap-6 h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <DocumentTabBar
            projectId={projectId}
            availableTabs={availableTabs}
            currentTab={tab}
          />

          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 p-6 font-mono text-sm bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck={false}
            />
          ) : isRegenerating ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-slate-200">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-slate-600">재생성 중...</p>
              </div>
            </div>
          ) : currentDoc ? (
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
            content={isEditing ? editContent : currentDoc.content}
            isEditing={isEditing}
            isRegenerating={isRegenerating}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </AppShell>
  );
}
