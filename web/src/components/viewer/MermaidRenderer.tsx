'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  chart: string;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current || !chart.trim()) return;

    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          er: { diagramPadding: 20 },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '다이어그램 렌더링 실패');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <p className="font-medium mb-1">ERD 렌더링 오류</p>
        <p className="font-mono text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex justify-center overflow-x-auto p-4 bg-white rounded-lg border border-slate-200"
    />
  );
}
