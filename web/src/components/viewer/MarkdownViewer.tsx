'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8 overflow-y-auto flex-1">
      <article className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold mt-6 mb-4 text-slate-900" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold mt-6 mb-3 pt-4 border-t border-slate-200 text-slate-900" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-900" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-lg font-semibold mt-3 mb-2 text-slate-900" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-slate-700 mb-4 leading-7" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside text-slate-700 mb-4 space-y-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-slate-700" {...props} />
            ),
            code: ({ node, inline, ...props }: any) => {
              if (inline) {
                return (
                  <code className="bg-slate-100 text-red-600 px-2 py-1 rounded text-sm font-mono" {...props} />
                );
              }
              return (
                <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />
              );
            },
            pre: ({ node, ...props }) => (
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...props} />
            ),
            table: ({ node, ...props }) => (
              <table className="w-full border-collapse border border-slate-300 my-4" {...props} />
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-slate-100" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-slate-300 px-4 py-2 text-slate-700" {...props} />
            ),
            a: ({ node, ...props }: any) => (
              <a className="text-indigo-600 hover:underline" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
